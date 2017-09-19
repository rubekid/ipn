/**
 * 配置常量
 */
// API 基础路径
global.API_BASE_PATH = process.env.API_BASE_PATH

// token 存储加密
global.TOKEN_ENCRYPT_ENABLE = process.env.TOKEN_ENCRYPT_ENABLE

// 刷新token地址
global.REFRESH_TOKEN_URI =  process.env.REFRESH_TOKEN_URI

// 登录URI
global.LOGIN_URI =  process.env.LOGIN_URI

// 应用名称
global.APP_NAME = process.env.APP_NAME

// 应用标题
global.APP_TITLE = process.env.APP_TITLE || global.APP_NAME

// 加密秘钥
global.APP_SECRET_KEY = process.env.APP_SECRET_KEY

// 默认头像
global.DEFAULT_AVATAR = process.env.DEFAULT_AVATAR

// 分页大小
global.PAGE_SIZE = process.env.PAGE_SIZE || 20

// 浏览器识别
var ua = navigator.userAgent.toLowerCase()
global.Browser = {
  isWechat: /micromessenger/.test(ua),
  isAlipay: /alipayclient/.test(ua),
  isCrawler: /author\/crawler/.test(ua)
}

/**
 * 设置浏览器标题
 * @param title
 */
global.setDocumentTitle = function (title) {
  title = title || global.APP_TITLE
  document.title = title
  if (/ip(hone|od|ad)/i.test(navigator.userAgent)) {
    setTimeout(function () {
      var iframe = document.createElement('iframe')
      iframe.src = '/MP_verify_dbtLjvj0pndDlxpP.txt'
      iframe.style.display = 'none'
      iframe.onload = function () {
        setTimeout(function () {
          iframe.remove()
        }, 0)
        document.body.appendChild(iframe)
      }
    }, 0)
  }
}
export {}
