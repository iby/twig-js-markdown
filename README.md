# Twig.js Markdown

`{% markdown %}` tag support for Twig templates using [twig.js](https://github.com/justjohn/twig.js) and [marked](https://github.com/chjj/marked) compiler. Compatible with [gulp-twig](https://github.com/zimmen/gulp-twig).

```html
<div class="content">
    <div>
        {% markdown %}
            # Embed markdown directly in your template…
        {% endmarkdown %}
    </div>
    <div>
        {% markdown '../or/embed/external/file.md' %}{% endmarkdown %}
    </div>
    <div>
        {% apply markdown_to_html %}
            # Title
        {% endapply %}
    </div>
    <div>
        {% set content = '# Title' %}
        {{ content|markdown_to_html }}
    </div>
</div>
```

## Install

```sh
npm install twig-markdown --save
```

## Use

In TypeScript:

```typescript
import * as twig from 'twig';
import twigMarkdown from 'twig-markdown';
twig.extend(twigMarkdown);
const template = twig.twig({ data: "{% markdown %}# Foo{% endmarkdown %}" });
template.render();
```

In JavaScript:

```js
const twigMarkdown = require('twig-markdown');
const twig = require('twig');
twig.extend(twigMarkdown);
const template = twig.twig({ data: "{% markdown %}# Foo{% endmarkdown %}" });
template.render();
```

In javascript with [gulp-twig](https://github.com/zimmen/gulp-twig) plugin:

```js
const twigMarkdown = require('twig-markdown');
const twigFoo = require('twig-foo');
const twig = require('gulp-twig');

// With only markdown extension.
twig({data: {}, extend: twigMarkdown});

// With multiple extensions.
twig({data: {}, extend: function(Twig){
    twigMarkdown(Twig);
    twigFoo(Twig);
}});
```

## Contribute

Install npm dependencies and you're good to go, assuming you also have globally [typescript](https://github.com/Microsoft/TypeScript):

```sh
npm install
```

Test with mocha:
```sh
npm test
```

Run build in watch mode:
```sh
npm start
```
