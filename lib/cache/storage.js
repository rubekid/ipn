/**
 *  本地缓存
 * Created by rubekid on 2017-08-11.
 */
var Storage = {
  get: function (key) {
    var value = localStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch (e) {}
    return value || null
  },
  set: function (key, object) {
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
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  },
  clear: function () {
    localStorage.clear()
  }
}

export default Storage

