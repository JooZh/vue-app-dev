const musicApi = require('./lib/music-api-for-qq/src/server');
module.exports = {
    pages: {
        index: {
            entry: 'src/app.js',
            // 模板来源
            template: 'public/index.html',
            // 在 dist/index.html 的输出
            filename: 'index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Index Page',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        }
    },
    // pwa: {
    //   name: "My App",
    //   themeColor: "#4DBA87",
    //   msTileColor: "#000000",
    //   appleMobileWebAppCapable: "yes",
    //   appleMobileWebAppStatusBarStyle: "black-translucent"

    // // 配置 workbox 插件
    // workboxPluginMode: "InjectManifest",
    // workboxOptions: {
    //   // InjectManifest 模式下 swSrc 是必填的。
    //   swSrc: "dev/sw.js"
    //   // ...其它 Workbox 选项...
    // }
    // },
    devServer: {
        port: 9001,
        before: function(app) {
            app.use('/music', musicApi.router('/api'));
        }
    }
};
