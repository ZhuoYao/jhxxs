const md5 = require('md5.js')
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

let baseUrl = 'http://127.0.0.1:8000/'
// let rootUrl = "http://127.0.0.1:8000/";
let rootUrl = "https://cumt.zguolee.cn/";
let rootUrl2 = "https://kdkd.cumtlee.cn/";


const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function isLogin(success) {
    if (wx.getStorageSync('user')) {
        return true
    } else {
        wx.showModal({
            title: '提示',
            content: '请先登录',
            showCancel: false,
            success: function (res) {
                return typeof success == "function" && success(res);
            }
        })
        return false
    }
}

function getToken() {
    var date = new Date()
    var timestamp = date.getTime().toString()
    var token = md5.hex_hmac_md5('cumt@123', timestamp)
    return {
        'timestamp': timestamp,
        'token': token,
    }
}

function req(url, data, su, fa) {
    wx.showLoading({
        title: '请稍后',
    })
    var tokens = getToken()
    data['timestamp'] = tokens.timestamp
    wx.request({
        url: rootUrl2 + url,
        data: data,
        method: 'post',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'token': tokens.token,
        },
        success: function (res) {
            if (res.statusCode < 399)
                return typeof su == "function" && su(res.data);
            else {
                return typeof fa == "function" && fa(res.data)
            }

        },
        fail: function (error) {
            return typeof fa == "function" && fa(error)
        },
        complete() {
            wx.hideLoading()
        }
    })
}

function request(url, data, method, header, success, fail) {
    wx.showLoading({
        title: '请稍后',
    })
    wx.request({
        url: rootUrl + url,
        data: data,
        method: method,
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': header,
        },
        success: function (res) {
            if (res.statusCode < 399)
                return typeof success == "function" && success(res.data);
            else {
                return typeof fail == "function" && fail(res.data)
            }

        },
        fail: function (error) {
            return typeof fail == "function" && fa(error)
        },
        complete() {
            wx.hideLoading()
        }
    })
}
const getTouchData = (startX, startY, endX, endY) => {
    console.log(startX, startY, endX, endY)
    // if (startX - endX > 50 && Math.abs(endY - startY) < 50) { //左滑
    //     console.log('left')
    //     return "left"
    // } else if (endX - startX > 50 && Math.abs(endY - startY) < 50) { //右滑
    //     console.log('right')
    //     return "right"
    // }
    //下拉
    if (endY - startY > 60 && Math.abs(endX - startX) < 50) {
        console.log('下拉')
        return true
    } else {
        return false
    }
}

module.exports = {
    formatTime: formatTime,
    req: req,
    request: request,
    baseUrl: baseUrl,
    rootUrl: rootUrl,
    rootUrl2: rootUrl2,
    getTouchData: getTouchData,
    isLogin: isLogin,
}