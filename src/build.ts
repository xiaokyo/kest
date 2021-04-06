import webpack from "webpack";
import { existsSync } from "fs";
import { success, error as logError } from "./chalk";
import WriteFileWebpackPlugin from "write-file-webpack-plugin";
import FriendlyErrorsWebpackPlugin from "friendly-errors-webpack-plugin";

// paths
import { resolvePath } from './config/paths'

// webpack configs
import { config as webpackConfig } from "./webpack/client";
import { config as serverWebpackConfig } from "./webpack/server";
import { config as dllWebpackConfig } from "./webpack/dll";

const compilerPromise = (compiler: webpack.Compiler) => {
  return new Promise((resolve, reject) => {
    compiler.hooks.done.tap("MyPlugin", (stats: webpack.Stats) => {
      if (!stats.hasErrors()) {
        return resolve('');
      }
      return reject(stats.compilation.errors);
    });
  });
};

export const start = async () => {
  webpackConfig?.plugins?.push(new webpack.HotModuleReplacementPlugin());
  webpackConfig?.plugins?.push(new WriteFileWebpackPlugin());
  webpackConfig?.plugins?.push(new FriendlyErrorsWebpackPlugin());

  const compiler = webpack([
    webpackConfig,
    serverWebpackConfig,
    dllWebpackConfig,
  ]);
  const clientCompiler = compiler.compilers[0];
  const serverCompiler = compiler.compilers[1];
  const dllCompiler = compiler.compilers[2];

  if (!existsSync(resolvePath(`/dist/dll/vendor.dll.js`))) {
    dllCompiler.run((err, stats) => {
      if (err || stats.hasErrors()) logError(err);
    });
    await compilerPromise(dllCompiler).catch((err) => logError(err));
    success("Dll build");
  }

  clientCompiler.run((err, stats) => {
    // Stats Object
    if (err) throw new Error(err.message);
  });

  serverCompiler.run((err, stats) => {
    // Stats Object
    if (err) throw new Error(err.message);
  });

  await compilerPromise(serverCompiler).catch((err) => logError(err));
  await compilerPromise(clientCompiler).catch((err) => logError(err));
};
