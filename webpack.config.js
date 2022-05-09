const path = require('path');

var config = {
    mode: 'development',
    experiments: {
        topLevelAwait: true
    },
    watch: false,
}

var configAlum = Object.assign({}, config, {
    name: "configAlum",
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist/alumnos'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        }]
    }
});

var configProf = Object.assign({}, config, {
    name: "configProf",
    entry: './src/profesores.js',
    output: {
        path: path.resolve(__dirname, 'dist/profesores'),
        filename: 'profesores.js'
    }
});

// Return Array of Configurations
module.exports = [configAlum, configProf];