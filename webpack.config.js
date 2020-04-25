const path = require('path');
module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js', 
  },
  module:{
    rules:[{
      test: /\.js$/,
      loader: 'babel-loader',
      include: [
        path.resolve(__dirname, './src'),
      ],
      options:{
        presets:['@babel/preset-react']
      }
    }]
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    compress: true,
    port: 8000,
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/views/landing.html' },
        { from: /^\/app/, to: '/app/index.html' },
      ]
    }
  },
}
