const path = require('path')
// import path from 'path'
const CopyPlugin = require('copy-webpack-plugin')
// import CopyPlugin from 'copy-webpack-plugin'

module.exports = {
    entry: './bootstrap.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bootstrap.js',
    },
    mode: 'development',
    plugins: [
        new CopyPlugin({
            patterns: ['index.html', { from: 'assets', to: 'assets' }],
        }),
    ],
    experiments: {
        asyncWebAssembly: true,
        // syncWebAssembly: true,
        topLevelAwait: true,
        //     outputModule: true,
    },
    // devServer: {
    //     static: {
    //         directory: path.join(__dirname, 'dist'),
    //     },
    // },
}
