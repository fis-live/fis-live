const helpers = require('./helpers');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const execSync = require('child_process').execSync;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackConfig = require('./webpack.common.js');
const { CheckerPlugin } = require('awesome-typescript-loader');
const { BaseHrefWebpackPlugin } = require('@angular-cli/base-href-webpack');


const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

const REPO_NAME_RE = /Push {2}URL: https:\/\/github\.com\/.*\/(.*)\.git/;

function getRepoName(remoteName) {
    remoteName = remoteName || 'origin';

    let stdout = execSync('git remote show ' + remoteName),
        match = REPO_NAME_RE.exec(stdout);

    if (!match) {
        throw new Error('Could not find a repository on remote ' + remoteName);
    } else {
        return match[1];
    }
}

const GIT_REMOTE_NAME = 'pages';
const GH_REPO_NAME = getRepoName(GIT_REMOTE_NAME);

module.exports = webpackMerge.smart(webpackConfig, {

    output: {
        filename: '[name].js',
        publicPath: '/',
        path: helpers.root('dist'),
        chunkFilename: '[id].chunk.js'
    },

    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[ext]'
            }
        ]
    },

    plugins: [
        new CheckerPlugin(),
        new BaseHrefWebpackPlugin({
            baseHref: '/'
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false, //prod
            mangle: { screw_ie8 : true, keep_fnames: true }, //prod
            compress: { screw_ie8: true, warnings: false }, //prod
            comments: false //prod
        }),
        new ExtractTextPlugin('css/[name].css'),
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
