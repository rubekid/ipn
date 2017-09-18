/**
 *  Ajax缓存
 * Created by rubekid on 2017-08-11.
 */
var AjaxCache = {
  PREFIX: 'CACHE:',
  get: function (key) {
    key = AjaxCache.PREFIX + key
    var value = localStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch (e) {}
    return value || null
  },
  set: function (key, object) {
    key = AjaxCache.PREFIX + key
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
      }
    }
  },
  remove: function (key) {
    key = AjaxCache.PREFIX + key
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  },
  clear: function () {
    var len = localStorage.length
    var keys = []
    for (let i = 0; i < len; i++) {
      var key = localStorage.key(i)
      if (!key) {
        continue
      }
      if (key.indexOf(AjaxCache.PREFIX) === 0) {
        keys.push(key)
      }
    }
    for (let i = 0; i < keys.length; i++) {
      localStorage.removeItem(keys[i])
    }
  },
  getCacheSize: function () {
    var len = localStorage.length
    var size = 0
    for (var i = 0; i < len; i++) {
      var key = localStorage.key(i)
      if (!key) {
        continue
      }
      if (key.indexOf(AjaxCache.PREFIX) === 0) {
        size += localStorage.getItem(key).length
      }
    }
    return size
  }

}

export default AjaxCache

