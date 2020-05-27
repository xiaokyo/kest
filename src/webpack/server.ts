import babelOptions from "../babel.config";
import common from "./common";
import { resolve } from "path";
import webpack from "webpack";
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import nodeExternals from 'webpack-node-externals'

const cwd = process.cwd();
const devMode = process.env.NODE_ENV === "development" ? true : false;

// alias
const alias: any = {};
// tslint:disable-next-line: forin
for (const key of Object.keys(common.alias)) {
  if (common.alias.hasOwnProperty(key)) {
    alias[key] = resolve(cwd, common.alias[key]);
  }
}

export const config: webpack.Configuration = {
  mode: devMode ? "development" : "production",
  target: "node",
  entry: [resolve(cwd, "src/server/index.js")],
  output: {
    path: resolve(cwd, "dist/server"),
    filename: "server.js",
    chunkFilename: "[id].server.js",
    publicPath: "/",
    libraryTarget: "commonjs2",
  },
  externals: [
    nodeExternals({
      whitelist: [/\.css$/, /\.png$/],
    }),
  ],
  resolve: {
    alias,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: /(src)/,
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
                  libraryDirectory: "lib",
                  style: false, // or 'css'
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.(less)$/,
        exclude: /(node_modules|bower_components)/, // 排除文件件
        use: [
          {
            loader: `css-loader`,
            options: {
              modules: {
                localIdentName: common.localIdentName,
              },
              onlyLocals: true,
            },
          },
          "less-loader",
        ],
      },
      {
        test: /\.(css)$/,
        use: [
          {
            loader: `css-loader`,
            options: {
              onlyLocals: true,
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
              limit: 8192,
              name: `${devMode ? `[name].[ext]` : `[contenthash:8].[ext]`}`,
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: false, // devMode ? false : true
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: devMode,
      __CLIENT__: false,
    }),
    new CleanWebpackPlugin(),
  ],
};
