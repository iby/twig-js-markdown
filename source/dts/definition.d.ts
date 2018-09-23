// Todo: the same definition was supplied to official repo, watch for the pr to get accepted
// todo: and remove this, https://github.com/justjohn/twig.js/pull/336.
declare module 'twig' {
    import {Context, Token, Parameters, Template, Core} from 'twig';

    namespace Twig {
        export interface Token {
            type: string;

            open?: any;
            close?: any;
            regex?: RegExp;
            next?: any[];
            output?: any;
            match?: string[];

            parse?(token: any, context: any, chain: any): ParsedToken;
            compile?(token: any): CompiledToken;
        }

        export interface CompiledToken {
            type: string;

            value: {};
            stack?: Token[];
            output: CompiledToken[];
        }

        export interface ParsedToken {
            chain: any;
            output: string;
        }

        export interface TokenGroup {
            type: any;
            definitions: Token[];

            extend(definition: Token): void;
            compile(token: Token): CompiledToken;
            tokenize(expression: string): Token[];
            extendType(type: string): void;
            parse(tokens: CompiledToken[], context: Context): any;
        }

        export interface ExpressionGroup extends TokenGroup {}
        export interface LogicGroup extends TokenGroup {}

        export interface Context {
            [key: string]: any;
        }

        export interface Template {
            base: string;
            path: string;
            url: string;
            name: string;
            options: any;

            new(parameters: Parameters.Template): Template;
            compile(options?: any): string;
            importBlocks(file: any, override: any): void;
            importFile(file: any): any;
            importMacros(file: any): any;
            render(context?: Context, parameters?: Parameters.Template): string;
            reset(blocks: any): void;
        }

        export interface Compiler {
            compile(template: Template, options: any): string;
            wrap(id: string, tokens: any): string;
        }

        export interface CompileOptions {
            filename: string;
            settings: any;
        }

        namespace Core {
            export class Error {
                constructor(message: string);
            }
        }

        export interface Core {
            trace: boolean;
            debug: boolean;
            cache: boolean;

            expression: ExpressionGroup;
            logic: LogicGroup;
            token: TokenGroup;
            compiler: Compiler;
            // exports:Exports;

            tokenize(template: string): any[];
            compile(tokens: any[]): CompiledToken[];
            parse(tokens: CompiledToken[], context: any): string;
            prepare(data: string): CompiledToken[];
            output(output: any): string;
        }

        export namespace Parameters {
            export interface Load {
                async?: any;
                base?: string;
                id?: any;
                method?: any;
                module?: any;
                options?: TemplateOptions;
                parser?: any;
                precompiled?: any;
            }

            export interface Template {
                base?: string;
                blocks?: any[];
                data?: any;
                id?: any;
                macros?: any[];
                method?: any;
                name?: string;
                options?: TemplateOptions;
                path?: string;
                url?: string;
                output?: string;
            }

            export interface TemplateOptions {
                strict_variables?: boolean;
                autoescape?: boolean,
                allowInlineIncludes?: boolean,
                rethrow?: boolean,
                namespaces?: any
            }

            export interface Core extends Template, TemplateOptions, Load {
                debug?: boolean;
                trace?: boolean;

                href?: any;
                module?: any;
                ref?: any;
            }
        }
    }

    class Twig {
        public static __express(path: string, options: any, fn: (err: Error, result: any) => void): void;
        public static cache(value: boolean): void;
        public static compile(markup: string, options: any): (context: Context) => any;
        public static extend(definition: (core: Core) => void): void;
        public static extendFilter(name: string, definition: (left: any, ...params: any[]) => string): void;
        public static extendFunction(name: string, definition: (...params: any[]) => string): void;
        public static extendTag(definition: Token): void;
        public static extendTest(name: string, definition: (value: any) => boolean): void;
        public static renderFile(path: string, options: any, fn: (error: Error, result: any) => void): void;
        public static twig(parameters: Parameters.Core): Template;
    }

    export = Twig;
}
