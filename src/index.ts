#!/usr/bin/env node
import { program } from "commander";
import { start as devStart } from "./dev";
import { start as buildStart } from "./build";

const { version } = require('../package.json')

program
  .version(version)
  .command("dev")
  .description("development")
  .action(() => {
    console.log(version);
    devStart();
  });

program
  .command("build")
  .description("production")
  .action(() => {
    buildStart();
  });

program.parse(process.argv);
