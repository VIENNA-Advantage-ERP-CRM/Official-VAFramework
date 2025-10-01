const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require('fs');

const deleteFilesByPattern = (directory, pattern) => {
    const files = fs.readdirSync(directory);
    const regex = new RegExp(pattern);
    files.forEach(file => {
        if (regex.test(file)) {
            fs.unlinkSync(path.join(directory, file));
        }
    });
};

deleteFilesByPattern(path.resolve(__dirname, 'Areas/VIS/Content'), /^VIS\.all\.min\d+\.\d+\.\d+\.\d+\.css$/);


const versions = {
    'VIS.all': '3.1.50.0',
    'VIS2_0': '3.1.50.0',
    'React': '1.0.0.1',
    'VIS': '3.1.41.0' // CSS Version
};

module.exports = {
    //mode: 'development', // for debuggin
    mode: 'production',
    entry: {
        'VIS.all': './Areas/VIS/Scripts/src/VISjs.js',
        'VIS2_0': './Areas/VIS/Scripts/src/VIS_v2.js',
        'React': './Areas/VIS/Scripts/src/reactjs.js',
        'VIS': './Areas/VIS/Content/src/css-style.css'
    },
    output: {
        filename: ({ chunk }) => {
            const name = chunk.name;
            const version = versions[name] || '1.0.0.0'; // Default version if not specified
            return `${name}.min${version}.js`;
        },
        path: path.resolve(__dirname, 'Areas/VIS/Scripts/dist')
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
                }
//                    ,
                //{
                //    loader: 'sass-loader',
                //    options: {
                //        sassOptions: {
                //            url: false
                //        }
                //    }
                //}
                ],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: ({ chunk }) => {
                const name = chunk.name;
                const version = versions[name] || '1.0.0'; // Default version if not specified
                return `../../Content/${name}.all.min${version}.css`;
            },
        }),
    ],
    optimization: {
        minimize: true, // Webpack 5 uses "minimize" instead of "minimizer"
        minimizer: [
            new CssMinimizerPlugin(), // Minify CSS
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }), // Minify JavaScript
        ]
    },
};
