import { resolve } from 'path'
import webpack from 'webpack'

const cwd = process.cwd()

export const config: webpack.Configuration = {
  mode: 'production',
  entry: {
    vendor: ['react', 'react-dom']
  },
  output: {
    path: resolve(cwd, 'dist/assets'),
    filename: '[name].dll.js',
    library: '[name]_[hash]',
    libraryTarget: 'this'
  },
  plugins: [
    new webpack.DllPlugin({
      context: process.cwd(),
      path: resolve(cwd, 'dist/[name]-manifest.json'),
      name: '[name]_[hash]'
    })
  ]
}