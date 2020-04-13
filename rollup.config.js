// rollup.config.js
import copy from 'rollup-plugin-copy';
import babel from 'rollup-plugin-babel';

const plugins = [
    copy({
        targets: [{
            src: [
                'manifest.json',
                'main.js',
                'injectedMain.js',
                'third-party',
                'icons',
                'pages/common/style-base.css'
            ],
            dest: ['dist/firefox/', 'dist/chrome/']
        }]
    }), 
    babel({
        exclude: ['node_modules/**', 'third-party/**']
    })
];

export default [{
    input: 'pages/4410/script.js',
    output: [{
        file: 'dist/chrome/bundle-4410.js',
        format: 'iife'
    },{
        file: 'dist/firefox/bundle-4410.js',
        format: 'iife'
    }],
    plugins: plugins
}, {
    input: 'pages/40-312/script.js',
    output: [{
        file: 'dist/chrome/bundle-40-312.js',
        format: 'iife'
    },{
        file: 'dist/firefox/bundle-40-312.js',
        format: 'iife'
    }],
    plugins: plugins
}];