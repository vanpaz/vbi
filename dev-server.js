var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var PORT = process.env.PORT || 3000;

var CONFIG = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:' + PORT,
    'webpack/hot/only-dev-server',
    './src/client/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
};



new WebpackDevServer(webpack(CONFIG), {
  contentBase: './src/client',
  publicPath: '',

  hot: true,
  historyApiFallback: true,

  stats: { colors: true }
}).listen(PORT, function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at http://localhost:' + PORT + '/');
});
