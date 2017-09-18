function Map () {
  return new Promise(function (resolve, reject) {
    window.onload = function () {
      resolve(window.BMap)
    }
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'http://api.map.baidu.com/getscript?v=2.0&ak=IcsEbrLvVxc0S5l3fzfn0TyDa12ki8Cr'
    script.onerror = reject
    document.head.appendChild(script)
  })
}
export default Map
