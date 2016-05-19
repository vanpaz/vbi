var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var version = require('./package.json').version;

module.exports = {
  entry: [
    './src/client/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.DefinePlugin({
      // make Redux happy
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new CopyWebpackPlugin([
      { from: 'src/client/app.css' },
      { from: 'src/client/favicon.ico' },
      { from: 'src/client/index.html' },
      { from: 'src/client/images', to: 'images' }
    ]),
    new webpack.BannerPlugin(
        '/**\n' +
        ' * VanPaz business intelligence\n' +
        ' * Version: ' + version  + '\n' +
        ' * Date: ' + new Date().toISOString() + '\n' +
        ' */', {
      entryOnly: true,
      raw: true
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
};
