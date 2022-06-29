const path = require('path');

module.exports = {

    entry: './core/scripts/persistent-storage.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'core/scripts')
    },
    mode: 'development',
    devtool: 'source-map'
};