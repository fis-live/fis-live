var helpers = require('./helpers');
var webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ghpages = require('gh-pages');
const execSync = require('child_process').execSync;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackConfig = require('./webpack.common.js');

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
const COMMIT_MESSAGE = 'Publish v' + process.env.npm_package_version;
const GH_REPO_NAME = getRepoName(GIT_REMOTE_NAME);
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge.smart(webpackConfig, {


    output: {
        path: helpers.root('dist'),
        chunkFilename: '[id].[hash].chunk.js',
        filename: '[name].js',
        publicPath: '/' + GH_REPO_NAME + '/'
    },

    module: {
        loaders: [
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[ext]'
            }
        ]
    },

    htmlLoader: {
        minimize: false // workaround for ng2
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
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
            debug: false
        }),
        function() {
            this.plugin('done', function(stats) {
                console.log('Starting deployment to GitHub.');

                const logger = function (msg) {
                    console.log(msg);
                };

                const options = {
                    logger: logger,
                    remote: GIT_REMOTE_NAME,
                    message: COMMIT_MESSAGE
                };

                ghpages.publish(helpers.root('dist'), options, function(err) {
                    if (err) {
                        console.log('GitHub deployment done. STATUS: ERROR.');
                        throw err;
                    } else {
                        console.log('GitHub deployment done. STATUS: SUCCESS.');
                    }
                });
            });
        }
    ]
});
