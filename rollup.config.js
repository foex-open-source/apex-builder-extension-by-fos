// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import builtins from 'rollup-plugin-node-builtins';
import replace from '@rollup/plugin-replace';

const outputFolder = 'dist/unpacked/';
const isFirefox = process.env.BROWSER === 'firefox';

const copyPluginConfig = {
    targets: [{
        src: [
            'src/manifest.json',
            'src/main.js',
            'src/assets',
            'src/css'
        ],
        dest: outputFolder
    }, {
        src: [
            'node_modules/golden-layout/src/css/goldenlayout-base.css',
            'node_modules/golden-layout/src/css/goldenlayout-dark-theme.css',
            'node_modules/golden-layout/src/css/goldenlayout-light-theme.css'
        ],
        dest: outputFolder + 'css/golden-layout/'
    }, {
        src: 'node_modules/vscode-oniguruma/release/*',
        dest: outputFolder + 'third-party/vscode-oniguruma/'
    }, {
        src: 'node_modules/vscode-textmate/release/*',
        dest: outputFolder + 'third-party/vscode-textmate/'
    },{
        src: 'src/third-party/font-apex-2.1',
        dest: outputFolder + 'third-party/'
    }]
};

// exclude the monaco-editor files from the firefox build
if(!isFirefox){
    copyPluginConfig.targets.push({
        src: 'node_modules/monaco-editor-slim/min',
        dest: outputFolder + 'third-party/monaco-editor/'
    }, {
        src: 'node_modules/monaco-editor-slim/min-maps',
        dest: outputFolder + 'third-party/monaco-editor/'
    });
}

export default {
    input: 'src/script.js',
    output: [{
        file: outputFolder + 'bundle.js',
        format: 'iife'
    }],
    plugins: [
        replace({
            __MONACO_BASE__: process.env.BROWSER === 'firefox'
                ? '"https://cdn.jsdelivr.net/npm/monaco-editor-slim@0.21.2/"'
                : 'window.fosExtensionBase + "third-party/monaco-editor/"',
            include: 'src/lib/monacoEditorHelper.js'
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
};