# Twig.js Markdown

`{% markdown %}` tag support for Twig templates using [twig.js](https://github.com/justjohn/twig.js) and [marked](https://github.com/chjj/marked) compiler. Compatible with [gulp-twig](https://github.com/zimmen/gulp-twig).

```
<div class="content">
    <div>
        {% markdown %}
            # Embed markdown directly in your template…
        {% endmarkdown %}
    </div>
    <div>
        {% markdown '../or/embed/external/file.md' %}{% endmarkdown %}
    </div>
</div>
```

## Install

```
npm install twig-markdown --save
```

## Use

In typescript:

```typescript
import twigMarkdown = require('twig-markdown');
import twig = require('twig');

twig.extend(twigMarkdown);
```

In javascript:

```js
var twigMarkdown = require('twig-markdown');
var twig = require('twig');

twig.extend(twigMarkdown);
```

In javascript with [gulp-twig](https://github.com/zimmen/gulp-twig) plugin:

```js
var twigMarkdown = require('twig-markdown');
var twigFoo = require('twig-foo');
var twig = require('gulp-twig');

// With only markdown extension.
twig({data: {}, extend: twigMarkdown});

// With multiple extensions.
twig({data: {}, extend: function(Twig){
    twigMarkdown(Twig);
    twigFoo(Twig);
}});
```

## Contribute

Install npm and tsd dependencies and you're good to go, assuming you also have globally installed [ts-node](https://github.com/TypeStrong/ts-node) and [typescript](https://github.com/Microsoft/TypeScript) packages, make sure to `cd dependency`.

```sh
npm install
```

Build using gulp, make sure to `cd build`.

```sh
gulp # or gulp watch
```

Test using mocha.

```sh
# TypeScript directly…
mocha --require ts-node/register --ui tdd source/ts/Test/**/*.ts
# …or built js.
mocha --ui tdd product/js/Test/**/*.js
```
