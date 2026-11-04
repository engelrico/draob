const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: path.resolve(__dirname, 'src/background/index.js'),
    content: path.resolve(__dirname, 'src/content/index.js'),
    popup: path.resolve(__dirname, 'src/popup/index.js'),
    options: path.resolve(__dirname, 'src/options/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
  },
  module: {
    rules: [{ test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' }],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  // No eval-based source maps: the extension CSP forbids eval.
  devtool: 'source-map',
  plugins: [new CopyPlugin({ patterns: [{ from: 'public', to: '.' }] })],
};
