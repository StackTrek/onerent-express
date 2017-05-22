'use strict';

const cwd = process.cwd();
const webpack = require('webpack');
const args = require('yargs').argv;

let config = {

  context: `${cwd}/public/typescript`,
  entry: {
    main: './main'
  },

  output: {
    path: `${cwd}/public/react`,
    filename: '[name].js'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },

  module: {
    loaders: [
      // All files with a '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx$/, loader: 'ts-loader' }
    ]
  },

  plugins: []
};

if (args.production) {

  // define global constants
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"production"'
  }));

  // minify
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    mangle: true
  }));
}

module.exports = config;
