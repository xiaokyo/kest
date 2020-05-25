import express from "express";
import webpack from "webpack";
import { existsSync } from "fs";
import { resolve as rsv } from "path";
import { success, error as logError, warning } from "./chalk";

// webpack configs
import { config as webpackConfig } from "./webpack/client";
import { config as serverWebpackConfig } from "./webpack/server";
import { config as dllWebpackConfig } from "./webpack/dll";

const WriteFileWebpackPlugin = require("write-file-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const nodemon = require("nodemon");

const cwd = process.cwd();

const app = express();

const compilerPromise = (compiler: webpack.Compiler, name: string = "") => {
  return new Promise((resolve, reject) => {
    // console.log(compiler)
    compiler.hooks.done.tap("MyPlugin", (stats: webpack.Stats) => {
      if (!stats.hasErrors()) {
        return resolve();
      }
      return reject(stats.compilation.errors);
    });
  });
};

/**
 * webpack's compiler run fun
 * @param compiler webpack compiler
 */
const compilerRunPromise = (compiler: webpack.Compiler) => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      return resolve("build success =-=");
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

  if (!existsSync(`${cwd}/dist/assets/vendor.dll.js`)) {
    const dllRun = await compilerRunPromise(dllCompiler).catch((err) => {
      logError(err);
      process.exit(0);
    });
    success(dllRun);
  }

  app.use(
    require("webpack-dev-middleware")(clientCompiler, {
      publicPath: webpackConfig?.output?.publicPath,
      logLevel: "silent", // 静默日志
    })
  );

  app.use(
    require("webpack-hot-middleware")(clientCompiler, {
      path: "/__hot_update",
      heartbeat: 2000,
    })
  );

  app.listen(8079);

  serverCompiler.watch(
    { ignored: /node_modules/ },
    (error: any, stats: any) => {
      if (!error && !stats.hasErrors()) {
        success("server build success");
        return;
      }

      if (error) {
        logError(error);
        process.exit(0);
      }
    }
  );

  await compilerPromise(serverCompiler, "server").catch((err) => {
    logError(err);
    process.exit(0);
  });

  await compilerPromise(clientCompiler, "client").catch((err) => {
    logError(err);
    process.exit(0);
  });

  const script = nodemon({
    script: rsv(cwd, "dist/server/server.js"),
    ignore: ["src", "scripts", "config", "./*.*", "dist/assets"],
  });

  script.on("restart", () => {
    warning("Server side app has been restarted.");
  });

  script.on("quit", () => {
    warning("Process ended");
    process.exit(0);
  });

  script.on("error", () => {
    logError("An error occured. Exiting");
    process.exit(1);
  });
};
