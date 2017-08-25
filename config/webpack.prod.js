const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const { AotPlugin } = require('@ngtools/webpack');
const { BaseHrefWebpackPlugin } = require('@angular-cli/base-href-webpack');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge.smart(commonConfig, {
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: '@ngtools/webpack',
            }
        ]
    },

    output: {
        path: helpers.root('dist'),
        publicPath: '/fis-live/dist/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    plugins: [
        new AotPlugin({
            tsConfigPath: helpers.root('tsconfig.json'),
            entryModule: helpers.root('src/app/app.module#AppModule')
        }),
        new BaseHrefWebpackPlugin({
            baseHref: '/fis-live/dist/'
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: { screw_ie8 : true, keep_fnames: true },
            compress: { screw_ie8: true, warnings: false },
            comments: false
        }),
        new ExtractTextPlugin('css/[name].[hash].css'),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            htmlLoader: {
                minimize: false // workaround for ng2
            }
        })
    ]
});