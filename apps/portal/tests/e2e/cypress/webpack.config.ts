const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  plugins: [],
  stats: 'minimal',
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  watchOptions: {
    ignored: /node_modules/
  }
};

