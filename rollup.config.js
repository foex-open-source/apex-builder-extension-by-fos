// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import builtins from 'rollup-plugin-node-builtins';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const outputDir = 'dist/unpacked/';
const editorOutputDir = 'dist/unpacked/editor/';
const isFirefox = process.env.BROWSER === 'firefox';

const globalPlugins = [
    json(),
    babel({
        exclude: 'node_modules/**',
        babelHelpers: 'runtime'
    }),
    resolve({
        browser: true,
        preferBuiltins: true
    })
];

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
        file: outputDir + 'fos-bundle-editor.js',
        format: 'iife'
    }],
    plugins: [
        ...globalPlugins,
        replace({
            __MONACO_BASE__: process.env.BROWSER === 'firefox'
                ? '"https://cdn.jsdelivr.net/npm/monaco-editor-slim@0.21.2/"'
                : 'FOS.extensionBase + "editor/third-party/monaco-editor/"',
            include: 'src/editor/lib/monacoEditorHelper.js'
        }),
        copy(copyPluginConfig),
        commonjs({
            exclude: ['**/lib/MonacoEditor.js']
        }),
        builtins()
    ]
};

// -------------------------------------------------
// Page Designer Config
// -------------------------------------------------

const pdConfig = {
    input: 'src/pageDesigner/script.js',
    output: [{
        file: outputDir + 'fos-bundle-pd.js',
        format: 'iife'
    }],
    plugins: [
        ...globalPlugins
    ]
};

// -------------------------------------------------
// Embedded Code Config
// -------------------------------------------------

const embeddedCodeConfig = {
    input: 'src/embeddedCode/script.js',
    output: [{
        file: outputDir + 'fos-bundle-embeddedCode.js',
        format: 'iife'
    }],
    plugins: [
        ...globalPlugins,
        copy({
            targets: [{
                src: [
                    'src/embeddedCode/third-party/prismjs/themes/*'
                ],
                dest: outputDir + 'third-party/prismjs/themes'
        }]})
    ]
};

// -------------------------------------------------
// Monaco Fixes
// -------------------------------------------------

const monacoFixesConfig = {
    input: 'src/monacoFixes/script.js',
    output: [{
        file: outputDir + 'fos-bundle-monacoFixes.js',
        format: 'iife'
    }],
    plugins: [
        ...globalPlugins
    ]
};

// -------------------------------------------------
// Global config
// -------------------------------------------------

const globalConfig = {
    input: 'src/global/script.js',
    output: [{
        file: outputDir + 'fos-bundle-global.js',
        format: 'iife'
    }],
    plugins: [
        ...globalPlugins
    ]
};

// -------------------------------------------------
// Exporting everything
// -------------------------------------------------

export default [globalConfig, editorConfig, pdConfig, embeddedCodeConfig, monacoFixesConfig];