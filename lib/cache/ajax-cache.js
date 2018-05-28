import Storage from './storage'
/**
 *  Ajax缓存
 * Created by rubekid on 2017-08-11.
 */
var AjaxCache = {
  PREFIX: 'CACHE:',
  get: function (key) {
    key = AjaxCache.PREFIX + key
    return Storage.get(key);
  },
  set: function (key, value, timeout) {
    key = AjaxCache.PREFIX + key
    Storage.set(key, value, timeout)
  },
  remove: function (key) {
    key = AjaxCache.PREFIX + key
    try {
        Storage.remove(key)
    } catch (e) {}
  },
  clear: function () {
    Storage.clearByPrefix(AjaxCache.PREFIX);
  },
  getCacheSize: function () {
    return Storage.getSizeByPrefix(AjaxCache.PREFIX)
  }

}

export default AjaxCache

