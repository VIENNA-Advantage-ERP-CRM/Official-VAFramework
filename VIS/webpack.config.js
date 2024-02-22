const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
module.exports = {
    entry: {
        'Scripts/VIS.all': [
            './Areas/VIS/Scripts/src/VISjs.js'
        ],
        'Scripts/VIS2_0': [
            './Areas/VIS/Scripts//src/VIS_v2.js'
        ],
        'Scripts/React': [
            './Areas/VIS/Scripts/src/reactjs.js'
        ],
        'Content/VIS':'./Areas/VIS/Scripts/src/cssStyle.css'

    },

    output: {
        filename: '[name].min.js', // Output bundle file
        path: path.resolve(__dirname, 'Areas/VIS'), // Output directory

    },
    resolve: {
        extensions: ['.jsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                },

            },
            {
                test: /\.(css|sass)$/,
                use: [MiniCssExtractPlugin.loader, {
                    loader: 'css-loader',
                    options: {
                        url: false,
                    }
                },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                url: false
                            }
                        }
                    }
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].all.min.css',
        }),
    ],
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(), // Minify CSS
        ],
    },
};
