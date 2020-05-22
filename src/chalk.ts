import chalk from "chalk";

const { bgYellow, bgGreen, bgRed } = chalk;

const log = console.log;
export const error = (...args: any[]) => log(bgRed.white("[error]:"), ...args);

export const success = (...args: any[]) =>
  log(bgGreen.white("[done]:"), ...args);

export const warning = (...args: any[]) =>
  log(bgYellow.black("[warn]"), ...args);

export { chalk };
