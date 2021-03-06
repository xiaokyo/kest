import babelOptions from "../babel.config";
import common from "./common";
import { resolve } from "path";
import webpack from "webpack";
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");
const devMode = process.env.NODE_ENV === "development" ? true : false;

const cwd = process.cwd() || ".";

// alias
const alias: any = {};
// tslint:disable-next-line: forin
for (const key of Object.keys(common.alias)) {
  if (common.alias.hasOwnProperty(key)) {
    alias[key] = resolve(cwd, common.alias[key]);
  }
}

const htmlWebpackOptions = devMode
  ? {
      initmeta: "<title>xiaokyo</title>",
      initState: "{}",
      filename: "app.html",
    }
  : {
      initmeta: "<!--meta-->",
      initState: "<!--initState-->",
      filename: "app.html",
    };

const app = [resolve(cwd, "src/client/index.js")];
if (devMode)
  app.unshift(
    "webpack-hot-middleware/client?path=http://localhost:8079/__hot_update&timeout=2000&overlay=false&reload=true"
  );

export const config: webpack.Configuration = {
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  target: "web",
  entry: {
    app,
  },
  output: {
    path: resolve(cwd, "dist/assets"),
    filename: `${devMode ? "[name].bundle" : "[name].[contenthash:8]"}.js`,
    publicPath: devMode ? "/" : "//cdn.xiaok.club/",
  },
  resolve: {
    alias,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            ...babelOptions,
            plugins: [
              ...babelOptions.plugins,
              [
                "import",
                {
                  libraryName: "antd",
                  libraryDirectory: "es",
                  style: true, // or 'css'
                },
              ],
            ],
          },
        },
      },
      {
        // 第三方样式包的处理
        test: /\.(less|css)$/,
        include: /(node_modules)/, // 指定文件夹中的样式文件
        use: [
          { loader: MiniCssExtractPlugin.loader },
          "css-loader",
          {
            loader: "less-loader",
            options: {
              modifyVars: {
                "primary-color": "#e3a86c",
                "link-color": "#e3a86c",
              },
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(less|css)$/,
        exclude: /(node_modules|bower_components)/, // 排除文件件
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: common.localIdentName,
              },
            },
          },
          "less-loader",
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: () => [require("postcss-preset-env")()],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192, // 小于8kg的会进行base64的保存方式导出到js
              name: `${devMode ? `[name].[ext]` : `[contenthash:8].[ext]`}`,
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: devMode ? false : true,
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /(\.css|\.less)$/,
          chunks: "all",
          enforce: true,
        },
        // commons: {
        //   name: 'vendor',
        //   test: /[\\/]node_modules[\\/]/,
        //   chunks: 'all'
        // }
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: devMode,
      __CLIENT__: true,
    }),
    new HtmlWebpackPlugin({
      ...htmlWebpackOptions,
      template: resolve(cwd, "public/index.kade"),
    }),
    new AddAssetHtmlWebpackPlugin({
      filepath: resolve(cwd, "dist/assets/vendor.dll.js"), // 对应的 dll 文件路径
    }),
    new webpack.DllReferencePlugin({
      manifest: resolve(cwd, "dist/vendor-manifest.json"), // dll文件引入
      context: __dirname,
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `${devMode ? `[name]` : `[name].[contenthash:8]`}.css`,
      ignoreOrder: true, // Enable to remove warnings about conflicting order
    }),
    new OptimizeCssAssetsPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
  // devServer: devServer,
};
