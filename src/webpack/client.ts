import babelOptions from "../babel.config";
import common from "./common";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import AddAssetHtmlWebpackPlugin from "add-asset-html-webpack-plugin";
import { resolvePath } from "../config/paths";

const devMode = process.env.NODE_ENV === "development" ? true : false;

// 自定义配置
const userConfig = require(resolvePath('/kest.config.js'));
if (!userConfig) throw new Error("cann't resolve kest.config.js");

// alias
const alias: any = {};
// tslint:disable-next-line: forin
for (const key of Object.keys(common.alias)) {
  if (common.alias.hasOwnProperty(key)) {
    alias[key] = resolvePath(common.alias[key]);
  }
}

const htmlWebpackOptions = {
  initmeta: "<!--meta-->",
  initState: "<!--initState-->",
  filename: "app.html",
};

const app = [resolvePath("src/client/index.js")];
if (devMode)
  app.unshift(
    `webpack-hot-middleware/client?path=http://localhost:8079/__hot_update&timeout=2000&overlay=false&reload=true`
  );

export const config: webpack.Configuration = {
  mode: devMode ? "development" : "production",
  target: "web",
  entry: {
    app,
  },
  output: {
    path: resolvePath("dist/assets"),
    filename: `${devMode ? "[name].bundle" : "[name].[hash:8]"}.js`,
    publicPath: devMode ? "/" : userConfig.cdnPath ?? "/",
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
              name: `${devMode ? `[name].[ext]` : `[hash:8].[ext]`}`,
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
      template: resolvePath("public/index.kade"),
    }),
    new AddAssetHtmlWebpackPlugin({
      filepath: resolvePath("dist/dll/vendor.dll.js"), // 对应的 dll 文件路径
    }),
    new webpack.DllReferencePlugin({
      manifest: resolvePath("dist/dll/vendor-manifest.json"), // dll文件引入
      context: __dirname,
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `${devMode ? `[name]` : `[name].[hash:8]`}.css`,
      ignoreOrder: true, // Enable to remove warnings about conflicting order
    }),
    new OptimizeCssAssetsPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
};
