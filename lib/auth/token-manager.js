/**
 * Token管理
 */
import axios from 'axios'
import AuthEncrypt from './auth-encrypt'
import Storage from '../cache/storage'
import Session from '../cache/session'
import DateUtil from '../utils/date-util'
import CryptoJS from 'crypto-js/core'
import AES from 'crypto-js/aes'

// token缓存
var tokenCacheKey = global.TOKEN_CACHE_KEY || ((global.APP_NAME || '') + '_USER_TOKEN')

// 登录信息缓存
var LOGIN_CACHE_KEY = (global.APP_NAME || '') + '_REMEMBER'
// TOKEN 加密码秘钥
var SECRET_KEY = global.APP_SECRET_KEY || 'YT79jp64wJWqfvqY'
// 是否开启TOKEN加密
var TOKEN_ENCRYPT_ENABLE = global.TOKEN_ENCRYPT_ENABLE

// API_BASE_PATH
var API_BASE_PATH = global.API_BASE_PATH;

// 登录接口
var LOGIN_URI = global.LOGIN_URI

// 刷新TOKEN接口
var REFRESH_TOKEN_URI = global.REFRESH_TOKEN_URI

var TokenStorage = global.TOKEN_STORAGE_METHOD === 'SESSION' ? Session : Storage

var TokenManager = {
  refreshLocked: false,
  loginLocked: false,
  /**
   * 获取token缓存KEY
    */
  getTokenKey: function() {
    return tokenCacheKey;
  },
  // 获取token
  getToken: function () {

    // 获取token注入
    if(global.getToken){
      token = global.getToken();
      if(token){
        return token;
      }
    }
    var data = TokenStorage.get(tokenCacheKey)
    var token = data
    if (data && TOKEN_ENCRYPT_ENABLE) {
      try {
        var bytes = AES.decrypt(data, SECRET_KEY)
        token = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      } catch (e) {
        console.log(e.message)
        token = null
      }
    }
    return token
  },
  get: function () {
    var token = TokenManager.getToken()
    if (!token || DateUtil.isExpired(token.expires_at)) {
      token = null
      this.clear(tokenCacheKey)
    }
    TokenManager.checkToken(token)
    return token
  },
  // 获取当前用户ID
  getUserId: function () {
    var token = this.get()
    if (token) {
      return token.user_id
    }
    return null
  },
  // 设置token
  set: function (token) {
    if (TOKEN_ENCRYPT_ENABLE) {
      var tokenString = AES.encrypt(JSON.stringify(token), SECRET_KEY).toString();
      TokenStorage.set(tokenCacheKey, tokenString)
    } else {
      TokenStorage.set(tokenCacheKey, token)
    }
  },
  // 清理token
  clear: function () {
    TokenStorage.remove(tokenCacheKey)
  },
  checkToken: function (token) {
    try {
      if (TokenManager.refreshLocked) {
        return
      }
      var needAutoLogin = false
      if (token) {
        var expireAt = DateUtil.toDate(token.expires_at)
        if(!expireAt){
            expireAt = new Date()
        }
        var remainTime = expireAt.getTime() - new Date().getTime()
        if (remainTime > 10 * 1000 && remainTime < 10 * 60 * 1000) { // 10 分钟
          var config = {
            baseURL: API_BASE_PATH,
            url: REFRESH_TOKEN_URI,
            method: 'get'
          }

          config.headers = {}
          config.headers['Content-Type'] = 'application/json'
          config.headers['Authorization'] = AuthEncrypt.getMac(config.method, config.baseURL + config.url, token)

          TokenManager.refreshLocked = true
          axios(config).then(function (response) {
            var token = response.data
            if (token && token.access_token) {
              TokenManager.set(token)
            }
            TokenManager.refreshLocked = false
          }).catch(function (e) {
            TokenManager.refreshLocked = false
            console.log(e.message)
            needAutoLogin = true
          })
        } else if (remainTime < 10000) {
          needAutoLogin = true
        }
      } else {
        needAutoLogin = true
      }
    } catch (e) {
      console.log(e.message)
    }
    if (needAutoLogin) {
      TokenManager.autoLogin()
    }
  },
  /**
   * 记住账号
   * @param loginData
   */
  remember: function (loginData) {
    var str = AES.encrypt(JSON.stringify(loginData), SECRET_KEY)
    TokenStorage.set(LOGIN_CACHE_KEY, str.toString())
  },
  /**
   * 忘记账号
   */
  forget: function () {
    TokenStorage.remove(LOGIN_CACHE_KEY)
  },
  /**
   * 自动登录
   */
  autoLogin: function (callback) {
    try {
      if (TokenManager.loginLocked) {
        return
      }
      var loginString = TokenStorage.get(LOGIN_CACHE_KEY)
      if (!loginString) {
        return
      }
      var bytes = AES.decrypt(loginString, SECRET_KEY)
      var loginData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      var config = {
        baseURL: API_BASE_PATH,
        url: LOGIN_URI,
        method: 'POST',
        data: loginData
      }
      config.headers = {}
      config.headers['Content-Type'] = 'application/json'
      TokenManager.loginLocked = true
      axios(config).then(function (response) {
        var token = response.data
        if (token && token.access_token) {
          TokenManager.set(token)
        }
        callback && callback()
        TokenManager.loginLocked = false
      }).catch(function (e) {
        TokenManager.loginLocked = false
      })
    } catch (e) {
      console.log(e.message)
    }
  }
}

/**
 * 唤醒token检测
 */
var wakeUpTokenCheck = function () {
  var token = TokenManager.getToken()
  TokenManager.checkToken(token)
}
wakeUpTokenCheck()

// 每分钟轮询
setInterval(function () {
  wakeUpTokenCheck()
}, 60000)

export default TokenManager
