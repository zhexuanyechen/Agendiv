const path = require('path');

var config = {
    mode: 'development',
    experiments: {
        topLevelAwait: true
    },
    watch: false
}

var configAlum = Object.assign({}, config, {
    name: "configAlum",
    entry: {
        index: './src/index.js',
        init: './src/inicializacion.js',
        calendario: './src/calendario.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist/alumnos'),
        filename: '[name].js'
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