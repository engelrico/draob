const path = require('path');

module.exports = {
  entry: {
    background: path.resolve(__dirname, '../background.js'),
    content: path.resolve(__dirname, '../content.js'),
    popup: path.resolve(__dirname, '../src/popup/index.js'),
    options: path.resolve(__dirname, '../src/options/index.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devtool: 'source-map'
};
