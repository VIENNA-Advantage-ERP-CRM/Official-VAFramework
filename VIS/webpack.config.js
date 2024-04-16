const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
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

const deleteLicenseFiles = (directory) => {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        if (file.endsWith('.LICENSE.txt')) {
            fs.unlinkSync(path.join(directory, file));
        }
    });
};

deleteFilesByPattern(path.resolve(__dirname, 'Areas/VIS/Scripts'), /^VIS\.all\.min\d+\.\d+\.\d+\.js$/);
deleteFilesByPattern(path.resolve(__dirname, 'Areas/VIS/Scripts'), /^VIS2_0\.min\d+\.\d+\.\d+\.js$/);
deleteFilesByPattern(path.resolve(__dirname, 'Areas/VIS/Scripts'), /^React\.min\d+\.\d+\.\d+\.js$/);
deleteFilesByPattern(path.resolve(__dirname, 'Areas/VIS/Scripts'), /^VIS\.min\d+\.\d+\.\d+\.js$/);
deleteFilesByPattern(path.resolve(__dirname, 'Areas/VIS/Content'), /^VIS\.all\.min\d+\.\d+\.\d+\.css$/);

// Delete LICENSE.txt files
deleteLicenseFiles(path.resolve(__dirname, 'Areas/VIS/Scripts'));
deleteLicenseFiles(path.resolve(__dirname, 'Areas/VIS/Content'));


const versions = {
    'VIS.all': '16.0.0',
    'VIS2_0': '16.1.0',
    'React': '2.0.0.1',
    'VIS': '16.0.0' // CSS Version
};

module.exports = {
     mode: 'development', // or 'production'
    entry: {
        'VIS.all': './Areas/VIS/Scripts/src/VISjs.js',
        'VIS2_0': './Areas/VIS/Scripts/src/VIS_v2.js',
        'React': './Areas/VIS/Scripts/src/reactjs.js',
        'VIS': './Areas/VIS/Scripts/src/cssStyle.css'
    },
    output: {
        filename: ({ chunk }) => {
            const name = chunk.name;
            const version = versions[name] || '1.0.0'; // Default version if not specified
            return `${name}.min${version}.js`;
        },
        path: path.resolve(__dirname, 'Areas/VIS/Scripts')
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
            filename: ({ chunk }) => {
                const name = chunk.name;
                const version = versions[name] || '1.0.0'; // Default version if not specified
                return `../Content/${name}.all.min${version}.css`;
            },
        }),
    ],
    optimization: {
        minimize: true, // Webpack 5 uses "minimize" instead of "minimizer"
        minimizer: [
            new CssMinimizerPlugin(), // Minify CSS
            new TerserPlugin(), // Minify JavaScript
        ]
    },
};
