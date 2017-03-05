const path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: {
    filename: './client/javascripts/app.js'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/js/'),
    publicPath: '/js/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader']
      }
    ]
  },
  stats: {
    // Nice colored output
    colors: true
  }
}
