#!/usr/bin/env node
import { program } from "commander";
import { start as devStart } from "./dev";

program
  .version(require("../package.json").version)
  .command("dev")
  .description("development")
  .action(() => {
    devStart();
  });

program.parse(process.argv);
