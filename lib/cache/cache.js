import Storage from './storage'
/**
 *  Ajax缓存
 * Created by rubekid on 2017-08-11.
 */
var Cache = {
  PREFIX: 'CACHE:',
  get: function (key) {
    key = Cache.PREFIX + key
    return Storage.get(key);
  },
  set: function (key, value, timeout) {
    key = Cache.PREFIX + key
    Storage.set(key, value, timeout)
  },
  remove: function (key) {
    key = Cache.PREFIX + key
    try {
        Storage.remove(key)
    } catch (e) {}
  },
  clear: function () {
    Storage.clearByPrefix(Cache.PREFIX);
  },
  getCacheSize: function () {
    return Storage.getSizeByPrefix(Cache.PREFIX)
  }

}

export default Cache

