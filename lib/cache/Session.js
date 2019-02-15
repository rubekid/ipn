/**
 *  sessionStorage
 * Created by rubekid on 2017-09-22.
 */
var Session = {
  /**
   * 获取
   * @param key 键名
   * @returns {Object}
   */
  get: function (key) {
    var value = sessionStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch (e) {}
    return value || null
  },
  /**
   * 设置
   * @param key 键名
   * @param object 键值
   */
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
        sessionStorage.setItem(key, value)
      }
    }
  },
  /**
   * 移除
   * @param key
   */
  remove: function (key) {
    try {
      sessionStorage.removeItem(key)
    } catch (e) {}
  },
  /**
   * 清理
   */
  clear: function () {
    sessionStorage.clear()
  }
}

export default Session

