/**
 * 配置常量
 */
// API 基础路径
global.API_BASE_PATH = process.env.API_BASE_PATH

// API DEBUG 模式用户ID
global.DEBUG_USERID = process.env.DEBUG_USERID

// TOKEN 存储方式
global.TOKEN_STORAGE_METHOD = process.env.TOKEN_STORAGE_METHOD

// token 缓存KEY
global.TOKEN_CACHE_KEY = process.env.TOKEN_CACHE_KEY;

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

// webhook
global.WEBHOOK_ACCESS_TOKEN = process.env.WEBHOOK_ACCESS_TOKEN || '4c5ece4ba88e4af782eb9d8c4d26ac7316947abba720b9b64b2fa012292263a5'

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


/**
 * webhook
 */
if(window){
    /**
     * 推送消息
     * @param message multi
     * @param msgType String
     */
    function push(body, msgType){
        msgType = msgType || 'text'
        var data = {
            'msgtype': msgType
        }
        data[msgType] = body;
        var xhr = new XMLHttpRequest()
        xhr.open('POST', 'http://talk.xmappservice.com/webhook.php?access_token=' + global.WEBHOOK_ACCESS_TOKEN, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data))
    }

    /**
     * 监听错误异常
     * @param err
     * @param url
     * @param line
     */
    window.onerror = function (err, url, line) {
        try {
            var message =
                '# **' + global.APP_TITLE + '**'
                + "\n\n"
                + '**User-Agent**：' + navigator.userAgent
                + "\n\n"
                + '**Error**：' + err
                + "\n\n"
                + '**Url**：' + url
                + "\n\n"
                + '**Line**：' + line

            var body = {
                title: '异常通知',
                text: message
            }
            push(body, 'markdown')
        } catch (e) {
        }
    }

    /**
     * 调试
     */
    window.debug = function(){
        var arr = []
        for (var i = 0; i < arguments.length; i++) {
            arr.push(arguments[i]);
        }
        var  content = JSON.stringify(arr);
        var body = {
            content: content
        }
        push(body)
    }
}

export {}
