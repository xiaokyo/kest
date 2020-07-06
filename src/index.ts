#!/usr/bin/env node
import { program } from "commander";
import { start as devStart } from "./dev";
import { start as buildStart } from './build'

program
  .version(require("../package.json").version)
  .command("dev")
  .description("development")
  .action(() => {
    console.log(require("../package.json").version);
    devStart();
  });

program
  .command("build")
  .description('production')
  .action(() => {
    buildStart()
  })

program.parse(process.argv);
