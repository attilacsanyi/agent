var webpack = require("webpack");
var SvgStore = require('webpack-svgstore-plugin');
var webpackFailPlugin = require('webpack-fail-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var ngtools = require('@ngtools/webpack');

var rootDir = path.resolve(__dirname, '../');
console.log(rootDir, __dirname);

module.exports = {
    entry: {
        polyfills: path.resolve(rootDir, 'src/shared/polyfills.ts'),
        vendor: path.resolve(rootDir, 'src/shared/vendor.ts'),
        app: path.resolve(rootDir, 'src/main.ts')
    },
    output: {
        path: rootDir + "/dist",
        filename: "[name].uhk.js"
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
        modules: [path.join(rootDir, "node_modules")],
        alias: {
            jquery: 'jquery/dist/jquery.min.js',
            select2: 'select2/dist/js/select2.full.min.js'
        }
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: ['@ngtools/webpack'], exclude: /node_modules/ },
            { test: /\.html$/, loader: 'html-loader?attrs=false' },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loaders: ['raw-loader', 'sass-loader']
            },
            { test: /jquery/, loader: 'expose?$!expose?jQuery' }
        ]
    },
    plugins: [
        //   new webpack.optimize.UglifyJsPlugin({ minimize: true })
        new ngtools.AotPlugin({
            tsConfigPath: path.resolve(rootDir, 'src/tsconfig.json'),
            entryModule: path.resolve(rootDir, 'src/app.module') + '#AppModule'
        }),
        new SvgStore({
            svgoOptions: {
                plugins: [
                    { removeTitle: true }
                ]
            }
        }),
        webpackFailPlugin,
        new CopyWebpackPlugin(
            [
                { from: './web/src/index.html', flatten: true },
                {
                    from: 'node_modules/font-awesome/css/font-awesome.min.css',
                    to: 'vendor/font-awesome/css/font-awesome.min.css'
                },
                {
                    from: 'node_modules/font-awesome/fonts',
                    to: 'vendor/font-awesome/fonts'
                },
                {
                    from: 'node_modules/bootstrap/dist/',
                    to: 'vendor/bootstrap'
                },
                {
                    from: 'images',
                    to: 'images'
                },
            ],
            {
                ignore: ['*.config.js']
            }
        ),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        })
    ]

}
