import { dirname } from 'path';
import { fileURLToPath } from 'url';

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import sveltePreprocess from 'svelte-preprocess';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: [
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
  devtool: false,
  devServer: {
    historyApiFallback: true,
    static: [
      path.resolve(__dirname, 'dist'),    // some dist files are not compiled by webpack.
      path.resolve(__dirname, 'public'),  // files that publish as it is.
    ],
    hot: true,
  },
};
