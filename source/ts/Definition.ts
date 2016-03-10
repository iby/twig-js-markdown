import {TokenDefinition, Context} from 'twig';

import fs = require('fs');
import twig = require('twig');
import marked = require('marked');

export function Definition(core:any) {
    core.exports.extendTag({
        type: 'markdown',
        regex: /^markdown(?:\s+(.+))?$/,
        next: ['endmarkdown'],
        open: true,
        compile: function (token:TokenDefinition) {

            // Turn parameters into tokens, we may or may not receive the file path, much explicitly check
            // to avoid fuck ups.

            token.stack = token.match[1] != null ? core.expression.compile.apply(this, [{
                type: core.expression.type.expression,
                value: token.match[1]
            }]).stack : [];

            delete token.match;

            return token;
        },
        parse: function (token:TokenDefinition, context:Context, chain:any) {
            var path:string = token.stack.length > 0 ? core.expression.parse.apply(this, [token.stack, context]) : '';
            var markdown:string;

            // If we have a path in the arguments and it exists, we load that file and use it in as the source,
            // otherwise use whatever is provided in the block.

            if (path != null && fs.existsSync(path)) {
                markdown = <any>fs.readFileSync(path, 'utf8');
            } else {
                markdown = core.parse.apply(this, [token.output, context]);
            }

            return {
                chain: chain,
                output: markdown == null || markdown == '' ? '' : marked(markdown)
            };
        }
    });

    core.exports.extendTag({
        type: 'endmarkdown',
        regex: /^endmarkdown$/,
        next: [],
        open: false
    });
}