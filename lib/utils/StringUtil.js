/**
 * 字符串工具类
 */

var StringUtil = {
    /**
     * 请求参数 a=1&b=2 转json
     * @param query
     */
    query2json: (query) => {
        var json = {}
        var arr = query.split('&')
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].split('=')
            json[a[0]] = a[1]
        }
        return json
    },
    /**
     * json 转请求参数
     * @param json
     * @returns {string}
     */
    json2query: (json) => {
        var arr= []
        for (var key in json) {
            arr.push(key + '=' + json[key])
        }
        return arr.join('&')
    }
}


export default StringUtil
