const ContextReplacementPlugin = require('webpack').ContextReplacementPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

const path = require("path");

module.exports = function(env, argv) {
    const prodLoaders = [
        {
            test: /\.ts$/,
            loader: '@ngtools/webpack'
        },
        {
            test: /\.js$/,
            loader: '@angular-devkit/build-optimizer/webpack-loader',
            options: {
                sourceMap: false
            }
        }
    ];

    const devLoaders = [
        {
            test: /\.ts$/,
            use: [
                {
                    loader: 'awesome-typescript-loader',
                    options: {
                        useForkChecker: true
                    }
                },
                {
                    loader: 'angular2-template-loader'
                }
            ]
        }
    ];

    const prodPlugins = [
        new AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../tsconfig.json'),
            entryModule: path.resolve(__dirname, '../src/app/app.module#AppModule')
        }),
        new PurifyPlugin()
    ];

    const devPlugins = [
        new CheckerPlugin()
    ];


    const publicPath = argv['output-public-path'] ? argv['output-public-path'] : '/';
    const mode = env.mode === 'prod' ? 'production' : 'development';
    const loaders = env.mode === 'prod' ? prodLoaders : devLoaders;
    const plugins = env.mode === 'prod' ? prodPlugins : devPlugins;
    const filename = env.mode === 'prod' ? '[name].[hash]' : '[name]';
    const chunkFilename = env.mode === 'prod' ? '[id].[hash].chunk' : '[id].chunk';
    const output = env.mode === 'prod' ? {
        path: path.resolve(__dirname, '../dist'),
    } : {};
    const dev = env.mode === 'prod' ? {} : {
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            historyApiFallback: true,
            stats: 'minimal',
            port: 8080
        }
    };

    return {
        entry: {
            'polyfills': path.resolve(__dirname, '../src/polyfills.ts'),
            'app': path.resolve(__dirname, '../src/main.ts')
        },

        resolve: {
            extensions: ['.js', '.ts']
        },

        module: {
            rules: [
                ...loaders,
                {
                    test: /\.html$/,
                    exclude: /index\.html/,
                    loader: 'raw-loader'
                },
                {
                    test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'assets/' + filename + '.[ext]'
                    }
                },
                {
                    test: /\.css$/,
                    exclude: path.resolve(__dirname, '../src/app'),
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: mode === 'production'
                            }
                        }
                    ]
                },
                {
                    test: /\.scss$|\.sass$/,
                    exclude: path.resolve(__dirname, '../src/app'),
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2, // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
                                minimize: mode === 'production'
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: (loader) => [
                                    require('autoprefixer')()
                                ]
                            }
                        },
                        'sass-loader'
                    ]
                }
            ]
        },

        mode: mode,
        ...dev,

        performance: {
            hints: false
        },

        output: {
            ...output,
            publicPath: publicPath,
            filename: 'assets/' + filename + '.js',
            chunkFilename: 'assets/' + chunkFilename + '.js'
        },

        plugins: [
            ...plugins,
            new MiniCssExtractPlugin({
                filename: 'assets/' + filename + '.css'
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../src/index.html'),
                baseHref: publicPath,
                favicon: path.resolve(__dirname, '../src/favicon.ico')
            }),
            new ContextReplacementPlugin(
                /(.+)?angular[\\\/]core(.+)?/,
                path.resolve(__dirname, '../src')
            )
        ]
    };
};
