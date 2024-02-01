const path = require('path');

module.exports = {
    entry: {
        'VIS.all': [
            './Areas/VIS/Scripts/src/VISjs.js'
        ],
        VIS2_0: [
            './Areas/VIS/Scripts//src/VIS_v2.js'
        ],
        React: [
            './Areas/VIS/Scripts/src/reactjs.js'
        ]

    },

    output: {
        filename: '[name].min.js', // Output bundle file
        path: path.resolve(__dirname, 'Areas/VIS/Scripts'), // Output directory

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

            }
        ]
    }
    //module: {
    //    rules: [
    //        {
    //            test: /\.(js|jsx)$/,
    //            exclude: /node_modules/,
    //            use: {
    //                loader: 'babel-loader'
    //            },

    //        }
    //    ]
    //}
};
