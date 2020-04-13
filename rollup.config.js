// rollup.config.js
import copy from 'rollup-plugin-copy';
import babel from 'rollup-plugin-babel';

const plugins = [
    copy({
        targets: [{
            src: [
                'src/manifest.json',
                'src/main.js',
                'src/injectedMain.js',
                'src/assets',
                'src/pages/common/style-base.css'
            ],
            dest: 'dist/src/'
        }, {
            src: [
                'node_modules/golden-layout/dist/goldenlayout.min.js',
                'node_modules/golden-layout/src/css/goldenlayout-base.css',
                'node_modules/golden-layout/src/css/goldenlayout-dark-theme.css'
            ],
            dest: 'dist/src/third-party/golden-layout/'
        }, {
            src: [
                'node_modules/terser/dist/bundle.min.js',
                'node_modules/terser/dist/bundle.min.js.map',
            ],
            dest: 'dist/src/third-party/terser/'
        }, {
            src: [
                'node_modules/less/dist/less.min.js',
                'node_modules/less/dist/less.min.js.map',
            ],
            dest: 'dist/src/third-party/less/'
        }, {
            src: 'node_modules/monaco-editor/min',
            dest: 'dist/src/third-party/monaco-editor/'
        }, {
            src: 'node_modules/monaco-editor/min-maps',
            dest: 'dist/src/third-party/monaco-editor/'
        }, {
            src: 'src/third-party/font-apex-2.1',
            dest: 'dist/src/third-party/'
        }]
    }),
    babel({
        exclude: ['node_modules/**']
    })
];

export default [{
    input: 'src/pages/4410/script.js',
    output: [{
        file: 'dist/src/bundle-4410.js',
        format: 'iife'
    }],
    plugins: plugins
}, {
    input: 'src/pages/40-312/script.js',
    output: [{
        file: 'dist/src/bundle-40-312.js',
        format: 'iife'
    }],
    plugins: plugins
}];