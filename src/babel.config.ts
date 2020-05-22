export default {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: 3,
      },
    ],
    "@babel/preset-react",
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    [
      "react-css-modules",
      {
        autoResolveMultipleImports: true, // 允许多个样式文件引入且不需要导出变量引用
        generateScopedName: "[local]--[hash:base64:8]",
        filetypes: {
          ".less": {
            syntax: "postcss-less",
          },
        },
      },
    ],
  ],
};
