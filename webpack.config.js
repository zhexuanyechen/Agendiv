const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var config = {
    mode: 'development',
    experiments: {
        topLevelAwait: true
    },
    watch: false,
    cache: false
}

var configAlum = Object.assign({}, config, {
    name: "configAlum",
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist/alumnos'),
        filename: 'index.js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                    loader: MiniCssExtractPlugin.loader
                },
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                }
            ]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'main.css'
        })
    ]
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