const path = require('path');
module.exports = {
    entry: {
        'tmap': './src/EchartsExtension/TMap/TMap.js',
    },
    output: {
        libraryTarget: 'umd',
        library: ['echarts', '[name]'],
        path: path.resolve(__dirname, 'dist'),
        filename: 'mapbox-echarts.js',
    },
    externals: {
        'echarts': 'echarts'
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                loader:'babel-loader',
                include:path.resolve(__dirname,'src'),
                exclude:path.resolve(__dirname,'node_modules')
            }
        ]
    }
};