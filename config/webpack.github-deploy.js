var helpers = require('./helpers');
var webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const execSync = require('child_process').execSync;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackConfig = require('./webpack.common.js');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const AotPlugin = require('@ngtools/webpack').AotPlugin;

const REPO_NAME_RE = /Push {2}URL: https:\/\/github\.com\/.*\/(.*)\.git/;

function getRepoName(remoteName) {
    remoteName = remoteName || 'origin';

    var stdout = execSync('git remote show ' + remoteName),
        match = REPO_NAME_RE.exec(stdout);

    if (!match) {
        throw new Error('Could not find a repository on remote ' + remoteName);
    } else {
        return match[1];
    }
}

const GIT_REMOTE_NAME = 'origin';
const GH_REPO_NAME = getRepoName(GIT_REMOTE_NAME);

module.exports = webpackMerge.smart(webpackConfig, {

    output: {
        filename: '[name].js',
        publicPath: '/' + GH_REPO_NAME + '/',
        path: helpers.root('dist'),
        chunkFilename: '[id].[hash].chunk.js'
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[ext]'
            }
        ]
    },

    plugins: [
        new AotPlugin({
            tsConfigPath: './tsconfig.json',
            entryModule: 'src/app/app.module#AppModule'
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        //new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false, //prod
            mangle: { screw_ie8 : true, keep_fnames: true }, //prod
            compress: { screw_ie8: true }, //prod
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
