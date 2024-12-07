const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: './index.ts',
    mode: isDevelopment ? 'development' : 'production',
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
        extensions: ['.ts', '.js'],
        fallback: {
            fs: 'empty',
        }
    },
    output: {
        filename: 'ledger-bridge.js',
        path: path.resolve(__dirname, './dist'),
        libraryTarget: 'commonjs2'
    },
};
