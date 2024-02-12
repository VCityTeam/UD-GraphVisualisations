const path = require('path');

module.exports = {
  mode:'development',
  entry: './src/Todo1.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};