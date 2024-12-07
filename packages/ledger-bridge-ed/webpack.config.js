const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: './src/index.ts',
    mode: isDevelopment ? 'development' : 'production',
    node: { fs: 'empty' },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.ts', '.js' ],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './dist'),
        libraryTarget: 'commonjs2'
    },
};
