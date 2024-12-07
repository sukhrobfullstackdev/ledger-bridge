const path = require('path');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: './src/index.ts',
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
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            fs: 'empty',
            buffer: require.resolve('buffer'),
        }
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './dist'),
        libraryTarget: 'commonjs2'
    },
};
