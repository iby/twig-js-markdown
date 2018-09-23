import {Core, CompiledToken, Context, ParsedToken, Token} from 'twig';

import fs = require('fs');
import marked = require('marked');
import path = require('path');

import pathJoin = path.join;
import pathIsAbsolute = path.isAbsolute;

export function unindent(string: string) {
    const regexp: RegExp = /^\s+/;
    let match: string[];

    // Do a quick test, if first line is unintended there's no need to carry on.

    if ((match = string.match(regexp)) == null) {
        return string;
    }

    const lines: string[] = string.split(/\n/);
    let indentation: string = null;

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

export function extend(core: any): void {

    // Fixme: this is a shitty hack until there's a better way dealing with definitions, twig repository accepts
    // fixme: typings PR… Without this depending projects require the full-blown twig definition.

    const Twig: Core = core;

    const markdownToken: Token = {
        type: 'markdown',
        regex: /^markdown(?:\s+(.+))?$/,
        next: ['endmarkdown'],
        open: true,
        compile: function (token: Token): CompiledToken {
            const compiledToken: CompiledToken = <any>token;
            const match: string[] = token.match;

            delete token.match;

            // Turn parameters into tokens, we may or may not receive the file path, much explicitly check
            // to avoid fuck ups.

            compiledToken.stack = match[1] == null ? [] : Twig.expression.compile.apply(this, [{
                type: Twig.expression.type.expression,
                value: match[1]
            }]).stack;

            return compiledToken;
        },
        parse: function (token: CompiledToken, context: Context, chain: any): ParsedToken {
            let path: string = token.stack.length > 0 ? Twig.expression.parse.apply(this, [token.stack, context]) : null;
            let markdown: string;
            const file: any = context == null ? null : context['_file'];

            // Make markdown file location relative to template file if we have that information.

            if (path != null && !pathIsAbsolute(path)) {
                path = pathJoin(file != null && file.base != null ? file.base : process.cwd(), path);
            }

            // If we have a path in the arguments and it exists, we load that file and use it in as the source,
            // otherwise use whatever is provided in the block.

            try {
                markdown = path == null
                    ? unindent(Twig.parse.apply(this, [token.output, context]))
                    : fs.readFileSync(path, 'utf8');
            } catch (error) {
                throw new Core.Error('Markdown file `' + path + '` could not be found.');
            } finally {
                markdown === '' && (markdown = null);
            }

            return {
                chain: chain,
                output: markdown == null ? '' : marked(markdown)
            };
        }
    };

    const endmarkdownToken: Token = {
        type: 'endmarkdown',
        regex: /^endmarkdown$/,
        next: [],
        open: false
    };

    Twig.logic.extend(markdownToken);
    Twig.logic.extend(endmarkdownToken);
}
