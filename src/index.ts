#!/usr/bin/env node
import { program } from "commander";
import { version } from "../package.json";
import { start as devStart } from './dev'

program
  .version(version)
  .command("dev")
  .description("development")
  .action(() => {
    devStart()
  });

program.parse(process.argv);
