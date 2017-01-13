const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const { CheckerPlugin } = require('awesome-typescript-loader');
const { BaseHrefWebpackPlugin } = require('@angular-cli/base-href-webpack');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge.smart(commonConfig, {
    //devtool: 'source-map',

    output: {
        path: helpers.root('dist'),
        publicPath: '/fis-live/dist/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    plugins: [
        new CheckerPlugin(),
        new BaseHrefWebpackPlugin({
            baseHref: '/fis-live/dist/'
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false, //prod
            mangle: { screw_ie8 : true, keep_fnames: true }, //prod
            compress: { screw_ie8: true, warnings: false }, //prod
            comments: false //prod
        }),
        new ExtractTextPlugin('css/[name].[hash].css'),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            htmlLoader: {
                minimize: false // workaround for ng2
            }
        })
    ]
});