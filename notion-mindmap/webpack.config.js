const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production',
    // mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'index.js', // <-- Important
        libraryTarget: 'this' // <-- Important
    },
    target: 'node', // <-- Important
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ]
    },
    externals: [nodeExternals()], // <-- Important
    // externals: [], // <-- Important
    optimization: {
        minimize: true, 
    },
};