/**
 * ajax 请求
 * Created by Administrator on 2017-08-11.
 */
import axios from 'axios'
import AuthEncrypt from '../auth/AuthEncrypt'
import DateUtil from '../utils/DateUtil'
import TokenManager from '../auth/TokenManager'
import Cache from '../cache/Cache'

var METHOD_GET = 'GET'
var METHOD_POST = 'POST'
var METHOD_PUT = 'PUT'
var METHOD_DELETE = 'DELETE'

/**
 * 请求锁
 * @type {{}}
 */
var lockMap = {}

/**
 * 错误提示
 * @type {Function}
 */
function showError(message){
  (global.showError || window.alert)(message)
}

/**
 * 参数重组
 * @param args
 */
function rebuild(args){
  var config = {};
  if(args.length === 1){
    if (typeof args[0] === 'string') {
      config.url = args[0]
    }
    else{
      config = args[0]
    }
  } else if (args.length === 2) {
    config = args[1] ? args[1] : {}
    config.url = args[0]
  }
  else if(args.length === 3) {
    config = args[2] ? args[2] : {}
    config.url = args[0]
    if(args[1] !== null){
      config.data = args[1]
    }
  }
  return config
}

var Http = {
  get: function () {
    var config = rebuild(arguments)
    config.method = METHOD_GET
    return Http.execute(config)
  },
  post: function () {
    var config = rebuild(arguments)
    config.method = METHOD_POST
    return Http.execute(config)
  },
  put: function () {
    var config = rebuild(arguments)
    config.method = METHOD_PUT
    return Http.execute(config)
  },
  delete: function () {
    var config = rebuild(arguments)
    config.method = METHOD_DELETE
    return Http.execute(config)
  },
  execute: function (config) {
    // 使用Promise 处理成功
    if (config.success == null) {
      return   new Promise(function (resolve, reject) {
          config.success = function(res){
              resolve(res)
          }
          Http.doExecute(config)
      })
    } else {
        Http.doExecute(config)
    }
  },
  doExecute: function (config) {
    config.cache = config.cache || config.useLast;
    config.method = (config.method || config.type || METHOD_GET).toUpperCase()

    // 设置头部
    config.headers = config.headers || {}
    // 普通表单方式提交
    if(config.form && config.method === METHOD_POST){
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/x-www-form-urlencoded'
    }
    else{
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
    }

    Http.combine(config)

    var lockKey = config.method + '#' + config.url + '#' + JSON.stringify(config.data||{});

	//非GET 对请求加锁处理
	if(config.method != METHOD_GET){
      if(lockMap[lockKey]){
          console.log("重复请求：" + lockKey, lockMap);
          return ;
      }
      lockMap[lockKey] = true
	}

    // 配置 DEBUG userId 方便调试
    if(global.DEBUG_USERID){
        config.headers['Authorization'] = "DEBUG userId=" + global.DEBUG_USERID;
    }
    else{
        // 设置授权头部
        var token = TokenManager.get()
        config.headers['Authorization'] = AuthEncrypt.getMac(config.method, config.baseURL + decodeURIComponent(config.url), token)
    }

    // 成功回调
    var successCallback = config.success || function (response, isCache) {}

    config.success = null
    delete config.success

    // 失败回调
    var errorCallback = config.error || function (response, status) {
        if(status && (status === 403 || status === 503)) {
            return
        }
        if (response && response.message) {
            showError(response.message)
        }
    }
    config.error = null
    delete config.error

    var completeCallback = function () {
	    delete lockMap[lockKey]
        if(config.loading !== false){
            global.hideLoading && global.hideLoading();
        }
      if (typeof config.complete === 'function') {
        config.complete()
      }

    }

    // 使用缓存数据
    if (config.method === METHOD_GET && config.cache) {
      var cacheData = Cache.get(config.url)
      if (cacheData) {
        var timestamp = cacheData.timestamp || 0;
        var res = cacheData.res;
        successCallback(res, true);

        var diffTime = (new Date().getTime() - timestamp) / 1000;  // 距离上次请求时间间隔 （秒）
        // 设置缓存过期时间则不再查询
        if(config.cacheTimeout && config.cacheTimeout > diffTime){
            completeCallback()
          return ;
        }
      }
    }

    config.timeout = 10000
    axios(config).then(function (result) {
      var response = result.data
      successCallback(response)
      completeCallback()

      // 设置数据缓存
      if (config.cache) {
        var cacheData = {
          timestamp: new Date().getTime(),  // 新增时间戳
          res: response
        }
        Cache.set(config.url, cacheData)
      }
    }).catch(function (error) {
      if (error && error.response) {
        if (config.ignore) {
          completeCallback()
          return
        }
        var response = error.response || {}
        var status = response.status

        // 返回true 将忽略系统处理
        if(!errorCallback(response.data || {}, response.status)) {
            if (status && status === 403) {
                global.login && global.login()
            } else if (status && status === 503) {
                global.sysLocked && global.sysLocked(response)
            }
        }
      } else {
        console.log('Error', error.message)
        /*errorCallback({
           message: '网络异常'
        }, 500)*/
      }
      completeCallback()
    })
  },
 /**
  * 文件上传
  * @param config
  */
  upload: function (config) {
      var uploadPromises = []
      var uploadRet = []
      var uploaders = config.uploaders
      for (var j = 0; j < uploaders.length; j++) {
          let index = j
          let uploader = uploaders[index]
          uploadPromises.push(new Promise((resolve, reject) => {
              let uploadUrl = uploader.uploadUrl || config.uploadUrl
              if (uploadUrl.indexOf('http') !== 0) {
                  if (!global.API_BASE_PATH) {
                      throw new Error('请配置接口基本地址global.API_BASE_PATH')
                  }
                  uploadUrl = global.API_BASE_PATH + '/' + uploadUrl.replace(/^\//, '')
              }

              let headers = uploader.headers || config.headers  || {}
              // 配置 DEBUG userId 方便调试
              if(global.DEBUG_USERID){
                  headers['Authorization'] = "DEBUG userId=" + global.DEBUG_USERID;
              }
              else{
                  // 设置授权头部
                  var token = TokenManager.get()
                  headers['Authorization'] = AuthEncrypt.getMac('POST', uploadUrl, token)
              }

              let formData = new window.FormData()
              formData.append(uploader.name, uploader.file)
              axios.post(uploadUrl, formData, {
                  headers: headers
              }).then((res) => {
                  var data = res.data
                  if (Object.prototype.toString.call(data) === '[object Array]' && !uploader.multiple) {
                      data = data[0]
                  }
                  uploader.success && uploader.success(data)
                  uploadRet[index] = data
                  resolve(data)

              }).catch((err) => {
                  var response = err.response || {}
                  var status = response.status
                  if(!reject(err)){
                      if (status && status === 403) {
                          global.login && global.login()
                      } else if (status && status === 503) {
                          global.sysLocked && global.sysLocked(response)
                      }
                  }
              })
          }))
      }
      Promise.all(uploadPromises).then(() => {
          config.complete && config.complete(uploadRet)
      }).catch((error) => {
        config.fail && config.fail(error)
      })
  },
  /**
   * 获取授权信息
   * @param config
   */
  getAuthorization: function (config) {
    config.method = (config.method || config.type || METHOD_GET).toUpperCase()
    Http.combine(config)
    var token = TokenManager.get()
    return AuthEncrypt.getMac(config.method, config.baseURL + config.url, token)
  },
  /**
   * 数据合并
   * @param config
   */
  combine: function (config) {
    // 替换路径占位符号
    if (config.path) {
      for (var key in config.path) {
          config.url = config.url.replace('{' + key + '}', config.path[key])
      }
      delete config.path
    }
    config.data = config.data || config.body || config.form;
	
	if(config.form){
		config.transformRequest = [function (data) {
			// Do whatever you want to transform the data
			var ret = ''
			for (var it in data) {
			  ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
			}
			return ret
		}];

	}


    var isFormData = window && config.data instanceof window.FormData
    if (!isFormData) {
      // 过滤掉null数据
      var data = config.data;
      var method = config.method
      if(config.query){
        data = config.query
        method = METHOD_GET
      }
      config.data = Http.filter(config.data)
      data = Http.filter(data)
      config.url = AuthEncrypt.httpUrlFormat(config.url, data, method)
    }
    // 非http开头的加上API_BASE_PATH
    if (config.url.indexOf('http') !== 0) {
      if (!global.API_BASE_PATH) {
        throw new Error('请配置接口基本地址global.API_BASE_PATH')
      }
      config.baseURL = global.API_BASE_PATH

      // 确保以斜杠开头
      if(config.url.indexOf('/') !== 0){
        config.url = '/' + config.url
      }
    }
    delete config.body
    delete config.query
    delete config.form
  },
  filter: function (data) {
    if (Object.prototype.toString.call(data) === '[object Array]') {
      for(let i=0 ; i<data.length; i++){
       data[i] = Http.filter(data[i]);
      }
      return data;
    }

    var _data = {}
    for (var i in data) {
      var val = data[i]
      if (val === null || typeof val === 'undefined') {
        continue
      }
      if (/\d{4}-\d{1,2}-\d{1,2} {1}\d{1,2}:\d{1,2}:\d{1,2}$/.test(val)) {
        val = DateUtil.toDate(val)
      }
      _data[i] = val
    }
    return _data
  }
}
export default Http

