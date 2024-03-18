import { ExtendTagOptions, ParseContext, TagParseOutput, TagToken, Twig } from 'twig';
import { marked, MarkedOptions } from 'marked';
import * as fs from 'fs';
import * as path from 'path';

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

export function extend(twig: Twig, options: MarkedOptions = {}): void {

    // See for details: https://github.com/twigjs/twig.js/wiki/Extending-twig.js-With-Custom-Tags

    const markdownToken: ExtendTagOptions = {
        type: 'markdown',
        regex: /^markdown(?:\s+(.+))?$/,
        next: ['endmarkdown'],
        open: true,
        compile: function(token: TagToken): TagToken {
            const compiledToken = token;
            const match = token.match!;

            // Turn parameters into tokens, we may or may not receive the file path, much explicitly check
            // to avoid fuck ups.
            compiledToken.stack = match[1] === undefined ? [] : twig.expression.compile.apply(this, [{
                type: twig.expression.type.subexpression,
                value: match[1]
            } as any]).stack;

            // Before this update we were deleting the whole match, which isn't allowed by official types.
            // But this works – hopefully that's what's needed…
            delete token.match[1];
            return compiledToken;
        },
        parse: function(token: TagToken, context: ParseContext, chain: boolean): TagParseOutput {
            let stack = token?.stack || [];
            let markdownPath = stack.length > 0 ? twig.expression.parse.apply(this, [stack, context]) as string : null;
            let markdown: string;

            // Make markdown file location relative to template file if we have that information.
            if (markdownPath != null && !path.isAbsolute(markdownPath)) {
                const templatePath = (this as any)?.template?.path;
                markdownPath = path.join(templatePath != null ? path.dirname(templatePath) : process.cwd(), markdownPath);
            }

            if (markdownPath == null) {
                markdown = unindent(this.parse!((token as any).output, context, false) as any);
            } else if (fs.existsSync(markdownPath)) {
                markdown = fs.readFileSync(markdownPath, 'utf8');
            } else {
                throw new Error('Markdown file `' + markdownPath + '` could not be found.');
            }

            return {
                chain: chain,
                output: markdown == '' ? '' : marked(markdown, options)
            };
        }
    };

    const endmarkdownToken: ExtendTagOptions = {
        type: 'endmarkdown',
        regex: /^endmarkdown$/,
        next: [],
        open: false
    };

    /**
     * The `markdown_to_html` filter to match Twig's filter syntax.
     * @param content The markdown content passed to the filter.
     * @returns The HTML rendered from the passed markdown content.
     * @see https://twig.symfony.com/doc/3.x/filters/markdown_to_html.html
     */
    function markdownToHtmlFilter(content: string): string {
        content = unindent(content);
        return marked(content, options);
    }

    twig.exports.extendTag(markdownToken);
    twig.exports.extendTag(endmarkdownToken);
    twig.exports.extendFilter('markdown_to_html', markdownToHtmlFilter);
}
