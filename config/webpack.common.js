const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const helpers = require('./helpers');

module.exports = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'app': './src/main.ts'
    },

    resolve: {
        extensions: ['.js', '.ts']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        query: {
                            useForkChecker: true
                        }
                    }, {
                        loader: 'angular2-template-loader'
                    }
                ]
            },
            {
                test: /\.html$/,
                loader: 'raw-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[hash].[ext]'
            },

            {
                include: helpers.root('src', 'app'),
                test: /\.css$/,
                loaders: ['raw-loader']
            },
            {
                include: helpers.root('src', 'app'),
                test: /\.less$/,
                loaders: ['raw-loader', 'less-loader']
            },
            {
                include: helpers.root('src', 'app'),
                test: /\.scss$|\.sass$/,
                loaders: ['raw-loader', 'sass-loader']
            },

            {
                test: /\.css$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({fallback:'style-loader', use: 'css-loader?sourceMap'})
            },
            {
                test: /\.less$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({fallback:'style-loader', use: 'css-loader!less-loader'})
            },
            {
                test: /\.scss$|\.sass$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({fallback:'style-loader', use: 'css-loader!sass-loader'})
            }
        ]
    },


    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'polyfills']
        }),

        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),

        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            helpers.root('src')
        )
    ]
};