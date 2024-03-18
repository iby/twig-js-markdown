import 'should';
import * as twig from 'twig';
import twigMarkdown from '../index';
import { unindent } from '../Extension';
import * as path from 'path';

suite('twig markdown', function() {
    const basePath = process.cwd()
    teardown(() => process.chdir(basePath));

    twig.extend(twigMarkdown);

    test('compile markdown with a relative path to the current working directory', function() {
        const template = twig.twig({ data: "{% markdown './test/markdown.md' %}NOT FOUND!{% endmarkdown %}" });
        template.render().should.equal('<h1>foo</h1>\n<p>bar</p>\n');
    });

    test('compile markdown with a relative path to the root template file with relative path', async function() {
        process.chdir('..');
        const template = twig.twig({ path: path.join(basePath, "test/template.twig"), async: false });
        template.render().should.equal('<h1>foo</h1>\n<p>bar</p>\n');
    });

    test('compile markdown with a relative path to the root template file with absolute path', async function() {
        const template = twig.twig({ path: path.join(process.cwd(), "/test/template.twig"), async: false });
        template.render().should.equal('<h1>foo</h1>\n<p>bar</p>\n');
    });

    test('compile markdown with a relative path to the leaf template file with relative path', async function() {
        process.chdir('..');
        const template = twig.twig({ path: path.join(basePath, "test/parent.twig"), async: false });
        template.render().should.equal('<h1>foo</h1>\n<p>bar</p>\n');
    });

    test('compile markdown with a relative path to the leaf template file with absolute path', async function() {
        const template = twig.twig({ path: path.join(basePath, "/test/parent.twig"), async: false });
        template.render().should.equal('<h1>foo</h1>\n<p>bar</p>\n');
    });

    test('error if markdown is not found at the given path', function() {
        const source = "{% markdown 'null.md' %}{% endmarkdown %}";
        const render = () => twig.twig({ data: source, rethrow: true, trace: false } as any).render();
        render.should.throw();
    });

    test('compile markdown in the block', function() {
        const template = twig.twig({ data: "{% markdown %}# Foo{% endmarkdown %}" });
        template.render().should.equal('<h1>Foo</h1>\n');
    });

    // TODO: Can't figure out how to make this work with an optional ending tag…
    // test('compile markdown using path without a closing tag', function() {
    //     const template = twig.twig({ data: "{% markdown './test/markdown.md' %}" });
    //     template.render().should.equal('<h1>foo</h1>\n<p>bar</p>\n');
    // });

    test('compile markdown in a filter with apply', function() {
        const template = twig.twig({ data: "{% apply markdown_to_html %}# Foo{% endapply %}" });
        template.render().should.equal('<h1>Foo</h1>\n');
    });

    test('compile markdown in a filter with a pipe', function() {
        const template = twig.twig({ data: "{{ content|markdown_to_html }}" });
        const variables = {
            'content': '# Foo'
        }
        template.render(variables).should.equal('<h1>Foo</h1>\n');
    });
});

suite('unindent', function() {
    test('unindent non-indented line', function() {
        unindent('foo\n  bar').should.equal('foo\n  bar');
    });

    test('unindent line with simple indentation', function() {
        unindent('  foo\n  bar\n  baz').should.equal('foo\nbar\nbaz');
    });

    test('unindent line with complex indentation', function() {
        unindent('  foo\n  bar\nbaz').should.equal('  foo\n  bar\nbaz');
    });

    test('unindent line with even more complex indentation', function() {
        unindent('    foo\n  bar\n baz').should.equal('   foo\n bar\nbaz');
    });
});
