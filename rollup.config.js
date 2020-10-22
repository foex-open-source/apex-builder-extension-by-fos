// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import builtins from 'rollup-plugin-node-builtins';
import replace from '@rollup/plugin-replace';

const outputDir = 'dist/unpacked/';
const editorOutputDir = 'dist/unpacked/editor/';
const isFirefox = process.env.BROWSER === 'firefox';

// -------------------------------------------------
// Editor Config
// -------------------------------------------------

const copyPluginConfig = {
    targets: [{
        src: [
            'src/extensionCore/manifest.json',
            'src/extensionCore/main.js',
            'src/extensionCore/assets',
        ],
        dest: outputDir
    }, {
        src: [
            'src/editor/css',
            'src/editor/assets',
        ],
        dest: editorOutputDir
    }, {
        src: [
            'node_modules/golden-layout/src/css/goldenlayout-base.css',
            'node_modules/golden-layout/src/css/goldenlayout-dark-theme.css',
            'node_modules/golden-layout/src/css/goldenlayout-light-theme.css'
        ],
        dest: editorOutputDir + 'css/golden-layout/'
    }, {
        src: 'node_modules/vscode-oniguruma/release/*',
        dest: editorOutputDir + 'third-party/vscode-oniguruma/'
    }, {
        src: 'node_modules/vscode-textmate/release/*',
        dest: editorOutputDir + 'third-party/vscode-textmate/'
    },{
        src: 'src/editor/third-party/font-apex-2.1',
        dest: editorOutputDir + 'third-party/'
    }]
};

// exclude the monaco-editor files from the firefox build
if(!isFirefox){
    copyPluginConfig.targets.push({
        src: 'node_modules/monaco-editor-slim/min',
        dest: editorOutputDir + 'third-party/monaco-editor/'
    }, {
        src: 'node_modules/monaco-editor-slim/min-maps',
        dest: editorOutputDir + 'third-party/monaco-editor/'
    });
}

const editorConfig = {
    input: 'src/editor/script.js',
    output: [{
        file: outputDir + 'bundle-editor.js',
        format: 'iife'
    }],
    plugins: [
        replace({
            __MONACO_BASE__: process.env.BROWSER === 'firefox'
                ? '"https://cdn.jsdelivr.net/npm/monaco-editor-slim@0.21.2/"'
                : 'window.fosExtensionBase + "editor/third-party/monaco-editor/"',
            include: 'src/editor/lib/monacoEditorHelper.js'
        }),
        copy(copyPluginConfig),
        resolve({
            browser: true,
            preferBuiltins: true
        }),
        commonjs({
            exclude: ['**/lib/MonacoEditor.js']
        }),
        builtins(),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'runtime'
        })
    ]
}

// -------------------------------------------------
// Page Designer Config
// -------------------------------------------------

const pdConfig = {
    input: 'src/pageDesigner/script.js',
    output: [{
        file: outputDir + 'bundle-pd.js',
        format: 'iife'
    }],
    plugins: [
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'runtime'
        })
    ]
}

// -------------------------------------------------
// Embedded Code Config
// -------------------------------------------------

const embeddedCodeConfig = {
    input: 'src/embeddedCode/script.js',
    output: [{
        file: outputDir + 'bundle-embeddedCode.js',
        format: 'iife'
    }],
    plugins: [
        copy({
            targets: [{
                src: [
                    'src/embeddedCode/third-party/prismjs/themes/*'
                ],
                dest: outputDir + 'third-party/prismjs/themes'
        }]}),
        resolve({
            browser: true,
            preferBuiltins: true
        }),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'runtime'
        })
    ]
}

// -------------------------------------------------
// Monaco Fixes
// -------------------------------------------------

const monacoFixesConfig = {
    input: 'src/misc/monacoFixes.js',
    output: [{
        file: outputDir + 'bundle-monacoFixes.js',
        format: 'iife'
    }]
}

// -------------------------------------------------
// Exporting everything
// -------------------------------------------------

export default [editorConfig, pdConfig, embeddedCodeConfig, monacoFixesConfig];