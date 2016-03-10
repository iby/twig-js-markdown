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
import {Definition as TwigMarkdownDefinition} from 'twig-markdown';
import Twig = require('twig');

Twig.extend(TwigMarkdownDefinition);
```

In javascript:

```js
var TwigMarkdownDefinition = require('twig-markdown').Definition;
var Twig = require('twig');

Twig.extend(TwigMarkdownDefinition);
```