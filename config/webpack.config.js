const ContextReplacementPlugin = require('webpack').ContextReplacementPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

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
        },
        {
            test: /\.css$/,
            exclude: path.resolve(__dirname, '../src/app'),
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: (loader) => [
                            require('cssnano')({
                                preset: ['default', {
                                    discardComments: {
                                        removeAll: true,
                                    }
                                }]
                            })
                        ]
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
                        importLoaders: 2
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: (loader) => [
                            require('autoprefixer')(),
                            require('cssnano')({
                                preset: ['default', {
                                    discardComments: {
                                        removeAll: true,
                                    }
                                }]
                            })
                        ]
                    }
                },
                'sass-loader'
            ]
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
        },
        {
            test: /\.css$/,
            exclude: path.resolve(__dirname, '../src/app'),
            use: [
                'style-loader',
                'css-loader'
            ]
        },
        {
            test: /\.scss$|\.sass$/,
            exclude: path.resolve(__dirname, '../src/app'),
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                'sass-loader'
            ]
        }
    ];

    const isProd = env.mode === 'prod';
    const filename = isProd ? '[name].[hash]' : '[name]';

    const prodPlugins = [
        new AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../tsconfig.json'),
            entryModule: path.resolve(__dirname, '../src/app/app.module#AppModule')
        }),
        new MiniCssExtractPlugin({
            filename: 'assets/' + filename + '.css'
        })
    ];

    const devPlugins = [
        new CheckerPlugin()
    ];


    const publicPath = argv['output-public-path'] ? argv['output-public-path'] : '/';
    const mode = isProd ? 'production' : 'development';
    const loaders = isProd ? prodLoaders : devLoaders;
    const plugins = isProd ? prodPlugins : devPlugins;
    const chunkFilename = isProd ? '[id].[hash].chunk' : '[id].chunk';
    const output = isProd ? {
        path: path.resolve(__dirname, '../dist'),
    } : {};
    const dev = isProd ? {} : {
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            historyApiFallback: true,
            stats: 'minimal',
            port: 8080
        }
    };

    const prod = isProd ? {
        optimization: {
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    terserOptions: {
                        output: {
                            comments: false
                        }
                    }
                })
            ]
        }
    } : {};

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
                {
                    // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
                    // Removing this will cause deprecation warnings to appear.
                    test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
                    parser: { system: true },
                },
                ...loaders,
                {
                    test: /\.html$/,
                    exclude: /index\.html/,
                    loader: 'html-loader'
                },
                {
                    test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'assets/' + filename + '.[ext]'
                    }
                }
            ]
        },

        mode: mode,
        ...dev,
        ...prod,

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
