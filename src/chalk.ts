import chalk from "chalk";

const { bgYellow, bgGreen, bgRed } = chalk;

type Color = "green" | "red" | "yellow";

const log = console.log;

/**
 * 将字符串输出加上颜色
 * @param args 输出的参数
 * @param color 颜色
 */
const setArgs = (args: any[], color: Color = "green") =>
  args.map((_) => {
    let r = _;
    if (typeof _ === "string") {
      r = chalk[color](r);
    }
    return r;
  });

export const error = (...args: any[]) =>
  log(bgRed.black(" ERROR "), ...setArgs(args, "red"));

export const success = (...args: any[]) =>
  log(bgGreen.black(" DONE "), ...setArgs(args, "green"));

export const warning = (...args: any[]) =>
  log(bgYellow.black(" WARN "), ...setArgs(args, "yellow"));

export { chalk };
