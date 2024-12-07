const path = require('path');

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
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto",
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
        filename: 'index.js',
        path: path.resolve(__dirname, './dist'),
        libraryTarget: 'commonjs2'
    },
};
