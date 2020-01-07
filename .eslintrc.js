// module.exports = {
//   root: true,
//   env: {
//     node: true
//   },
//   extends: ["plugin:vue/essential", "@vue/prettier"],
//   rules: {
//     "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
//     "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
//   },
//   parserOptions: {
//     parser: "babel-eslint"
//   }
// };

module.exports = {
  extends: [
    'eslint-config-djfe/vue',
  ],
  globals: {
    // 这里填入你的项目需要的全局变量
    // 这里值为 false 表示这个全局变量不允许被重新赋值，比如：
    //
    // Vue: false
  },
  rules: {
    'no-new': 'off',
    // 这里填入你的项目需要的个性化配置，比如：
  }
};
