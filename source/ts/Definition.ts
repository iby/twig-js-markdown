import {Core, CompiledToken, Context, ParsedToken, Token} from 'twig';

import fs = require('fs');
import twig = require('twig');
import marked = require('marked');
import path = require('path');

import pathJoin = path.join;
import pathIsAbsolute = path.isAbsolute;

export function Definition(core:any):void {

    // Fixme: this is a shitty hack until there's a better way dealing with definitions, twig repository accepts typings PR…

    var Twig:Core = core;

    var markdownToken:Token = {
        type: 'markdown',
        regex: /^markdown(?:\s+(.+))?$/,
        next: ['endmarkdown'],
        open: true,
        compile: function (token:Token):CompiledToken {
            var compiledToken:CompiledToken = <any>token;
            var match:string[] = token.match;

            delete token.match;

            // Turn parameters into tokens, we may or may not receive the file path, much explicitly check
            // to avoid fuck ups.

            compiledToken.stack = match[1] == null ? [] : Twig.expression.compile.apply(this, [{
                type: Twig.expression.type.expression,
                value: match[1]
            }]).stack;

            return compiledToken;
        },
        parse: function (token:CompiledToken, context:Context, chain:any):ParsedToken {
            var path:string = token.stack.length > 0 ? Twig.expression.parse.apply(this, [token.stack, context]) : null;
            var markdown:string;
            var file:any = context == null ? null : context['_file'];

            // Make markdown file location relative to template file if we have that information.

            if (path != null && !pathIsAbsolute(path)) {
                path = pathJoin(file != null && file.base != null ? file.base : process.cwd(), path);
            }

            // If we have a path in the arguments and it exists, we load that file and use it in as the source,
            // otherwise use whatever is provided in the block.

            try {
                markdown = path == null ? Twig.parse.apply(this, [token.output, context]) : fs.readFileSync(path, 'utf8');
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

    var endmarkdownToken:Token = {
        type: 'endmarkdown',
        regex: /^endmarkdown$/,
        next: [],
        open: false
    };

    Twig.logic.extend(markdownToken);
    Twig.logic.extend(endmarkdownToken);
}