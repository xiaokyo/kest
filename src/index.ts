#!/usr/bin/env node
import { program } from "commander";
import { bold, keyword } from "chalk";
import { version } from "../package.json";

const log = console.log;
const error = (val: any) => log(bold.red("[ERROR]:"), val);
const success = (val: any) => log(bold.green("[DONE]:"), val);
const warning = (val: any) => log(keyword("orange")("[WARNING]:"), val);

program
  .version(version)
  .command("dev [env]")
  .description("development")
  .action((env) => {
    error(env);
    success(env);
    warning(env);
  });

program.parse(process.argv);
