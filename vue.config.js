/*
 * @Descripttion:
 * @version:
 * @Author: 韩震
 * @Date: 2023-04-23 22:47:09
 * @LastEditors: 韩震
 * @LastEditTime: 2023-04-24 12:40:18
 */
const path = require("path");

const resolve = (dir) => path.join(__dirname, dir);

module.exports = {
  lintOnSave: false, //设置是否在开发环境下每次保存代码时都启用 eslint验证。
  chainWebpack: (config) => {
    config.resolve.alias.set("@", resolve("src"));
    // https://juejin.cn/post/6992023855384494116
    // 使用vue支持glsl文件
    config.module
      .rule("webgl")
      .test(/\.(glsl|vs|fs|vert|frag)$/)
      .exclude.add(/node_modules/)
      .end()
      .use("raw-loader")
      .loader("raw-loader")
      .end()
      .use("glslify-loader")
      .loader("glslify-loader")
      .end();
  },
};
