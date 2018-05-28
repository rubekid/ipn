/**
 *  本地缓存
 * Created by rubekid on 2017-08-11.
 */
var STORAGE_EXPIRE_MAP = 'STORAGE_EXPIRE_MAP'
var Storage = {
  /**
   * 获取缓存
   * @param key 键名
   * @returns {Object}
   */
  get: function (key) {
    var value = localStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch (e) {}
    return value || null
  },
  /**
   * 设置缓存
   * @param key 键名
   * @param object 键值
   * @param expire 有效时长（秒）
   */
  set: function (key, object, expire) {
    if (object !== null && object !== undefined) {
      var value = object
      if (typeof value !== 'string') {
        try {
          value = JSON.stringify(object)
        } catch (e) {
          value = null
        }
      }
      if (value !== null) {
        localStorage.setItem(key, value)
        if (expire && expire > 0){
          var expireAt = new Date().getTime() + expire * 1000
          addExpire(key, expireAt)
        }
      }
    }
  },
  /**
   * 移除
   * @param key
   */
  remove: function (key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  },
  /**
   * 清理
   */
  clear: function () {
    localStorage.clear()
  },
  /**
   * 根据前缀清理
    * @param prefix
   */
  clearByPrefix: function(prefix){
      var len = localStorage.length
      var keys = []
      for (var i = 0; i < len; i++) {
          var key = localStorage.key(i)
          if (!key) {
              continue
          }
          if (key.indexOf(prefix) === 0) {
              keys.push(key)
          }
      }
      for (var i = 0; i < keys.length; i++) {
          localStorage.removeItem(keys[i])
      }
  },
  /**
   * 根据前缀获取缓存大小
   * @param prefix
   */
  getSizeByPrefix: function(prefix){
      var len = localStorage.length
      var size = 0
      for (var i = 0; i < len; i++) {
          var key = localStorage.key(i)
          if (!key) {
              continue
          }
          if (key.indexOf(prefix) === 0) {
              size += localStorage.getItem(key).length
          }
      }
      return size
  }
}

/**
 * 设置过期
 * @param key
 * @param expireAt
 */
function addExpire(key, expireAt) {
  var map = Storage.get(STORAGE_EXPIRE_MAP) || {}
  map[key] = expireAt
  Storage.set(STORAGE_EXPIRE_MAP, map)
}

/**
 * 清理过期
 */
function clearExpire (){
  var map = Storage.get(STORAGE_EXPIRE_MAP) || {}
  var now = new Date().getTime()
  for(var key in map){
    if (map[key] * 1 < now){
      Storage.remove(key)
      delete map[key]
    }
  }
  Storage.set(STORAGE_EXPIRE_MAP, map)
}

/**
 * 过期轮询
 */
setInterval(function(){
  clearExpire()
}, 60000)

export default Storage

