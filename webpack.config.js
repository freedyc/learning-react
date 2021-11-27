const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
module.exports =  {
    mode: 'development',
    devtool: 'cheap-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-flow', // 调试React专用
                            '@babel/preset-react'
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    resolve: {
        modules: [path.resolve(__dirname, 'libs/react', 'packages')]
            
    },
    plugins: [
       new HTMLWebpackPlugin({
           template: path.join(__dirname, 'public/index.html'),
       })
    ]
}