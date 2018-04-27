/**
 * 时间工具类
 */

var DateUtil = {}

/**
 * 是否为时间
 * @param input
 * @returns {boolean}
 */
DateUtil.isDate = function (input) {
  return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]'
}

/**
 * 字符串转成时间
 * @param date
 * @returns {*}
 */
DateUtil.toDate = function (date) {
  // 时间对象
  if (DateUtil.isDate(date)) {
    return date
  }
  // 空
  if (!date) {
    return date
  }
  // 时间戳
  if (/^\d{10}$/.test(date)) {
    date = date * 1000
  }
  if (/^\d{13}$/.test(date)) {
    return new Date(date)
  }

  var spiltDate = date.split(/[T|\s]/)
  if (spiltDate.length < 2) {
    return new Date(date)
  }
  var fullDate = spiltDate[0].split('-')
  var fullTime = spiltDate[1].split(':')

  return new Date(fullDate[0], fullDate[1] - 1, fullDate[2], (fullTime[0] != null ? fullTime[0] : 0), (fullTime[1] != null ? fullTime[1] : 0), (fullTime[2] != null ? fullTime[2].split('.')[0] : 0))
}

/**
 * 判断是否过期
 * @param isoDateStr
 * @returns {boolean}
 */
DateUtil.isExpired = function (date) {
  date = DateUtil.toDate(date)
  if (date && date.getTime() < new Date().getTime()) {
    return true
  }
  return false
}

/**
 * 时间比较
 * @param d1
 * @param d2
 * @returns {number}
 */
DateUtil.compare = function (d1, d2){
  var date1 = DateUtil.toDate(d1)
  var date2 = DateUtil.toDate(d2)
  return date1.getTime() - date2.getTime()
}

/**
 * 时间格式化
 * @param date
 * @param format
 */
DateUtil.format = function (date, format) {
  date = DateUtil.toDate(date)
  var o = {
      "M+" : date.getMonth()+1, //month
      "d+" : date.getDate(),    //day
      "H+" : date.getHours(),   //hour
      "m+" : date.getMinutes(), //minute
      "s+" : date.getSeconds(), //second
      "q+" : Math.floor((date.getMonth()+3)/3),  //quarter
      "S" : date.getMilliseconds(), //millisecond
      "Z" : date.toString().replace(/.*GMT([+\-\d]{5}).*/, "$1")


  };
  var week = {
      "0" : "\u65e5",
      "1" : "\u4e00",
      "2" : "\u4e8c",
      "3" : "\u4e09",
      "4" : "\u56db",
      "5" : "\u4e94",
      "6" : "\u516d"
  };
  if(/(y+)/.test(format)) format = format.replace(RegExp.$1,(date.getFullYear()+"").substr(4- RegExp.$1.length));
  if(/(E+)/.test(format)) format = format.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[date.getDay()+""]);
  for(var k in o)
      if(new RegExp("("+ k +")").test(format))
          format = format.replace(RegExp.$1,RegExp.$1.length==1? o[k] :("00"+ o[k]).substr((""+ o[k]).length));
  return format;
}


export default DateUtil
