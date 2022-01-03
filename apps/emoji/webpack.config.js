const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: [
          // 'babel-loader',
          {
            loader: 'svelte-loader',
            options: {
              emitCss: true,
              preprocess: sveltePreprocess()
            }
          }
        ],
      },
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|svg)$/,
        use: 'file-loader',
      },
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.svelte'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new MiniCssExtractPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, 'dist'),  // some dist files are not compiled by webpack.
    hot: true,
  },
};
