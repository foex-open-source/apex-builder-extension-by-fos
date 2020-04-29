// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import builtins from 'rollup-plugin-node-builtins';

const outputFolder = 'dist/unpacked/';

const plugins = [
    copy({
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
            src: 'node_modules/monaco-editor/min',
            dest: outputFolder + 'third-party/monaco-editor/'
        }, {
            src: 'node_modules/monaco-editor/min-maps',
            dest: outputFolder + 'third-party/monaco-editor/'
        }, {
            src: 'src/third-party/font-apex-2.1',
            dest: outputFolder + 'third-party/'
        }]
    }),
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
];

export default {
    input: 'src/script.js',
    output: [{
        file: outputFolder + 'bundle.js',
        format: 'iife'
    }],
    plugins: plugins
};