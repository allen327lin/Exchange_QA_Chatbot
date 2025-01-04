// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/proxy',  // 所有發往 /proxy 的請求將會被代理
    createProxyMiddleware({
      target: 'https://oia.ntut.edu.tw', // 目標網站的基礎 URL
      changeOrigin: true,
      pathRewrite: {
        '^/proxy': '', // 重寫 /proxy 路徑為空，實際上是發送到目標 URL 的
      },
    })
  );
};