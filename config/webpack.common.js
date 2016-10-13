var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ProvidePlugin = require('webpack/lib/ProvidePlugin');
var atl = require('awesome-typescript-loader');
var helpers = require('./helpers');

// Use our jQuery
const _jquery = helpers.root('node_modules', 'jquery');

module.exports = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/main.ts'
    },

    resolve: {
        extensions: ['.js', '.ts']
    },

    module: {
        loaders: [
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
                loader: ExtractTextPlugin.extract({fallbackLoader:'style-loader', loader: 'css-loader?sourceMap'})
            },
            {
                test: /\.less$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({fallbackLoader:'style-loader', loader: 'css-loader!less-loader'})
            },
            {
                test: /\.scss$|\.sass$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({fallbackLoader:'style-loader', loader: 'css-loader!sass-loader'})
            }
        ]
    },

    plugins: [
        new atl.ForkCheckerPlugin(),

        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),

        new ProvidePlugin({
            jQuery: _jquery,
            $: _jquery,
            jquery: _jquery
        }),

        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('src')
        )
    ]
};