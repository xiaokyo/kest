import express from "express";
import webpack from "webpack";
import { existsSync } from "fs";
import { resolve as rsv } from "path";
import { success, error as logError, warning } from "./chalk";
import WriteFileWebpackPlugin from "write-file-webpack-plugin";
import FriendlyErrorsWebpackPlugin from "friendly-errors-webpack-plugin";
import nodemon from "nodemon";

// webpack configs
import { config as webpackConfig } from "./webpack/client";
import { config as serverWebpackConfig } from "./webpack/server";
import { config as dllWebpackConfig } from "./webpack/dll";

const cwd = process.cwd();

const app = express();

const compilerPromise = (compiler: webpack.Compiler) => {
  return new Promise((resolve, reject) => {
    compiler.hooks.done.tap("MyPlugin", (stats: webpack.Stats) => {
      if (!stats.hasErrors()) {
        return resolve();
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

  if (!existsSync(`${cwd}/dist/dll/vendor.dll.js`)) {
    dllCompiler.run((err, stats) => {
      if (err || stats.hasErrors()) logError(err);
    });
    await compilerPromise(dllCompiler).catch((err) => logError(err));
    success("Dll build");
  }

  serverCompiler.watch(
    { ignored: ["dist", "node_modules"] },
    (error: any, stats: any) => {
      if (!error && !stats.hasErrors()) {
        success("Server build");
        return;
      }

      if (error) {
        logError(error);
        process.exit(0);
      }
    }
  );

  await compilerPromise(serverCompiler).catch((err) => logError(err));

  app.use(
    require("webpack-dev-middleware")(clientCompiler, {
      publicPath: webpackConfig?.output?.publicPath,
      logLevel: "silent", // 静默日志
      watchOptions: {
        ignored: ["dist", "node_modules"],
      },
    })
  );

  app.use(
    require("webpack-hot-middleware")(clientCompiler, {
      path: "/__hot_update",
      heartbeat: 2000,
    })
  );

  app.listen(8079);

  await compilerPromise(clientCompiler).catch((err) => logError(err));

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
