const path = require('path');

const HOST = 'localhost';
const PORT = process.env.PORT || 8080;
const PublicPath = '/';

module.exports = {
  contentBase: path.join(__dirname, '..', 'public'),
  compress: true,
  quiet: true,
  hot: true,
  host: HOST,
  port: PORT,
  open: true,
  overlay: true
};
