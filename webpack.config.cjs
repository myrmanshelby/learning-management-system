const path = require('path');

module.exports = {
  entry: './src/frontend/index.tsx',
  devtool: 'inline-source-map',
  mode: 'development', // TODO: update for a prod release
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      // Uncomment the following rule if you decide to use SCSS
      // {
      //   test: /\.scss$/i,
      //   use: ['style-loader', 'css-loader', 'sass-loader'],
      // },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'frontend/bundle.js',
    path: path.resolve(__dirname, 'dist'), // Cross-platform friendly path
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
};
