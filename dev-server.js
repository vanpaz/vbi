var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var PORT = process.env.PORT || 8081;
var BACKEND_SERVER_URL = process.env.BACKEND_SERVER  || 'http://localhost:8080';

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

  proxy: {
    '/api/*': {
      target: BACKEND_SERVER_URL,
      secure: false
    }
  },

  stats: { colors: true }
}).listen(PORT, function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Front-end development server listening at http://localhost:' + PORT + '/');
  console.log('Proxy to backend server: ' + BACKEND_SERVER_URL + '/api/*');
});
