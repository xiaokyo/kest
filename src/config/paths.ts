import path from 'path'

/** 路径集合 */
interface Paths {
  /** 根目录 */
  rootPath: string
}

const cwd = process.cwd() // 当前运行命令的目录

/**
 * 获取完整路径
 * @param filePath 路径
 * @returns 完整路径
 */
export const resolvePath = (filePath: string = '') => path.join(cwd, filePath)

const paths: Paths = {
  rootPath: resolvePath(),
}

export default paths