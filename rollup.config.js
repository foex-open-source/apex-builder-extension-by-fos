// rollup.config.js
import copy from 'rollup-plugin-copy';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';

const plugins = [
    copy({
        targets: [{
            src: [
                'src/manifest.json',
                'src/main.js',
                'src/assets',
                'src/css'
            ],
            dest: 'dist/extension'
        }, {
            src: [
                'node_modules/golden-layout/src/css/goldenlayout-base.css',
                'node_modules/golden-layout/src/css/goldenlayout-dark-theme.css',
                'node_modules/golden-layout/src/css/goldenlayout-light-theme.css'
            ],
            dest: 'dist/extension/css/golden-layout/'
        }, {
            src: 'node_modules/monaco-editor/min',
            dest: 'dist/extension/third-party/monaco-editor/'
        }, {
            src: 'node_modules/monaco-editor/min-maps',
            dest: 'dist/extension/third-party/monaco-editor/'
        }, {
            src: 'src/third-party/font-apex-2.1',
            dest: 'dist/extension/third-party/'
        }]
    }),
    resolve({ browser:true, preferBuiltins: true }),
    commonjs(),
    builtins(),
    babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
    })
];

export default {
    input: 'src/script.js',
    output: [{
        file: 'dist/extension/bundle.js',
        format: 'iife'
    }],
    plugins: plugins
};