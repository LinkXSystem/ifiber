const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const EntryFilePath = path.resolve(__dirname, '..', 'App.js');
const DistPath = path.resolve(__dirname, '..', 'dist');
const HtmlTemplateFilePath = path.resolve(
  __dirname,
  '..',
  'public',
  'index.html'
);

module.exports = {
  entry: EntryFilePath,
  mode: 'development',
  output: {
    filename: 'App.js',
    path: DistPath
  },
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: HtmlTemplateFilePath
    })
  ]
};
