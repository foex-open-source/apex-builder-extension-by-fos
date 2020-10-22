## Changelog

### 20.1.2

- APEX 20.2 specific: Ability to disable code editor suggestions
- APEX 20.2 specific: Added syntax highlighting on the Embedded Code page

### 20.1.1

- Improved syntax highlighting

### 20.1.0

- Added editing of theme files on page 267
- Syntax highlighting is now based on TextMate grammars
- Save button now saves, compiles and minifies
- Added settings menu. First option: Theme selection
- Upgraded Monaco Editor & Terser
- Added fix to avoid accidental browser "Back" action when horizontally scrolling
- Changed versioning system to match APEX

#### Major changes

- The Firefox add-on does not work offline anymore. Due to a file size restriction of 4MB, Monaco cannot be bundled with the extension anymore (tsWorker.js is the culprit). The library will be loaded through a CDN instead.

### 0.3.0

- added CSS file minification
- added Sourcemap file generation for JS & CSS
- added Plug-in boilerplace code section

### 0.2.1

- Fixed color mode detection on cloud instances