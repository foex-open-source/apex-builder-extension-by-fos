![](https://github.com/foex-open-source/apex-builder-extension-by-fos/workflows/build/badge.svg)
<a href="https://chrome.google.com/webstore/detail/apex-builder-extension-by/jhmmfmhnhnnfnejfphieclbibmoaapid">![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jhmmfmhnhnnfnejfphieclbibmoaapid?color=green&label=chrome%20extension)</a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/apex-builder-extension-by-fos/">![Mozilla Add-on](https://img.shields.io/amo/v/apex-builder-extension-by-fos?color=orange&label=firefox%20add-on)</a>

<h1 align="center">APEX Builder Extension by FOS</h1>

<p align="center"><img width="600" src="https://raw.githubusercontent.com/foex-open-source/apex-builder-extension-by-fos/master/misc/image-dark.png"/></p

The APEX Builder Extension by FOS is a free and open-source Chrome & Firefox browser extension that enables the editing of static application, workspace and plug-in files.

## Features

- Editing of static application, workspace and plug-in files directly in the builder
- Leverages the same powerful editor as the one behind VS Code
- Allows the editing of multiple files at once. Simply open a new file, and drag the tab
- Save changes without a page submit
- Create new JavaScript, CSS, Less, JSON and HTML files right in the builder
- Minification of JavaScript files and compilation of Less files
- many more features to come

## Build

Feel free to fork this repo if you'd like to contribute or build your own version.

```bash
# get up and running
npm install
npm run build         # will create dist/unpacked

# create packed extensions
npm run pack-chrome   # will create dist/chrome.zip
npm run pack-firefox  # will create dist/firefox.zip
```

## Changelog

version | changes
--------|--------------
0.4.0   | Upgraded Monaco Editor & Terser. Theme files support. Fixed constant "Go Back" browser action on 2 finger horizontal scroll
0.3.0   | CSS minification, sourcemap generation, plug-in boilerplate code
0.2.1   | Fixed color mode detection on cloud instances

## License

MIT
