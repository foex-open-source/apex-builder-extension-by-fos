# Monaco Editor Slim

This repository is a distribution of the [Monaco Editor](https://github.com/Microsoft/monaco-editor/), **without the built-in languages**.

The only difference in how the editor is compiled can be seen in metadata.js. The "monaco-languages" are commented out.

This can be helpful if you wish to use your own grammars and don't want the default grammars to override yours.

To use this distribution, simply use "monaco-editor-slim" instead of "monaco-editor". E.g:

```
npm install monaco-editor-slim
```

I will try to keep this repository up to date, and push a release to npm right after monaco-editor does, but feel free to open an issue if I lag behind.

## Inspiration

See [this comment](https://github.com/microsoft/monaco-editor/issues/884#issuecomment-389778611) and [this other comment](https://github.com/microsoft/monaco-editor/issues/1915#issuecomment-698586843)

## License
Licensed under the [MIT](https://github.com/Microsoft/monaco-editor/blob/master/LICENSE.md) License.