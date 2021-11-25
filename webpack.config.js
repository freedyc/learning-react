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
                        presets: ['@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    plugins: [
       new HTMLWebpackPlugin({
           template: path.join(__dirname, 'public/index.html'),
       })
    ]
}