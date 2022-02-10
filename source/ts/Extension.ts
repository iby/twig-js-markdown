import { Twig, CompiledToken, Context, ParsedToken, Token } from 'twig';
import { marked } from 'marked';
import * as fs from 'fs';
import * as path from 'path';

const pathJoin = path.join;
const pathIsAbsolute = path.isAbsolute;

export function unindent(string: string): string {
    const regexp: RegExp = /^\s+/;
    let match: RegExpMatchArray | null;

    // Do a quick test, if the first line is unintended there's no need to carry on.
    if ((match = string.match(regexp)) == null) {
        return string;
    }

    const lines: string[] = string.split(/\n/);
    let indentation: string | null = null;

    for (let line of lines) {
        // Ignore completely empty lines, otherwise if we got no match it means string is unintended, meaning
        // we can return right here. Otherwise carry on.
        if (line === '') {
            continue;
        } else if ((match = line.match(regexp)) == null) {
            return string;
        } else if (indentation == null || indentation.length > match[0].length) {
            indentation = match[0];
        }
    }

    return string.replace(new RegExp('^' + indentation), '').replace(new RegExp('\n' + indentation, 'g'), '\n');
}

export function extend(twig: Twig, options: any = {}): void {

    // Fixme: this is a shitty hack until there's a better way dealing with definitions, twig repository accepts
    // fixme: typings PR… Without this depending projects require the full-blown twig definition.

    const markdownToken: Token = {
        type: 'markdown',
        regex: /^markdown(?:\s+(.+))?$/,
        next: ['endmarkdown'],
        open: true,
        compile: function(token: Token): CompiledToken {
            const compiledToken = token as CompiledToken;
            const match = token.match!;

            // Turn parameters into tokens, we may or may not receive the file path, much explicitly check
            // to avoid fuck ups.
            compiledToken.stack = match[1] === undefined ? [] : twig.expression.compile.apply(this, [{
                type: twig.expression.type.subexpression,
                value: match[1]
            } as any]).stack;

            delete token.match;
            return compiledToken;
        },
        parse: function(token: CompiledToken, context: Context, chain: boolean): ParsedToken {
            let stack = token?.stack || [];
            let path = stack.length > 0 ? twig.expression.parse.apply(this, [stack as any, context]) : null;
            const file = context == null ? null : context['_file'];
            let markdown: string;

            // Make markdown file location relative to template file if we have that information.
            if (path != null && !pathIsAbsolute(path)) {
                path = pathJoin(file != null && file.base != null ? file.base : process.cwd(), path);
            }

            if (path == null) {
                markdown = unindent(this.parse!(token.output, context, false) as any);
            } else if (fs.existsSync(path)) {
                markdown = fs.readFileSync(path, 'utf8');
            } else {
                throw new twig.Error('Markdown file `' + path + '` could not be found.');
            }

            return {
                chain: chain,
                output: markdown == '' ? '' : marked(markdown, options)
            };
        }
    };

    const endmarkdownToken: Token = {
        type: 'endmarkdown',
        regex: /^endmarkdown$/,
        next: [],
        open: false
    };

    twig.exports.extendTag(markdownToken);
    twig.exports.extendTag(endmarkdownToken);
}
