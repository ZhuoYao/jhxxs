const util = require('../../utils/util.js')
Page({
    data: {},
    onLoad: function () {

    },
    formSubmit: function (e) {
        wx.clearStorage()
        var that = this
        // 获取用户信息
        wx.getSetting({
            success(res) {
                // console.log(res)
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        success: function (res) {
                            // console.log(res.userInfo)
                            //性别 0：未知、1：男、2：女
                            wx.setStorageSync('wx_info', res.userInfo)
                            if (!e.detail.value.username || !e.detail.value.password) {
                                wx.showModal({
                                    title: '提示',
                                    content: '请输入完整的账号或密码！',
                                    showCancel: false
                                })
                            } else {
                                var post_data = {
                                    username: e.detail.value.username,
                                    password: e.detail.value.password,
                                }
                                if (e.detail.value.username.length == 6) {
                                    //社团登录
                                    wx.request({
                                        url: util.rootUrl + 'login/',
                                        data: post_data,
                                        method: 'POST',
                                        success(res) {
                                            var res = res.data
                                            console.log(res)
                                            if (res.status == 200) {
                                                wx.setStorageSync(
                                                    'user', {
                                                        'username': post_data.username,
                                                        'password': post_data.password,
                                                        'token': res.data[0].token,
                                                    })
                                                wx.setStorageSync('user_info', res.data[0].user_info)
                                                wx.navigateBack(-1)
                                            } else {
                                                wx.showModal({
                                                    title: '提示',
                                                    content: res.msg,
                                                    showCancel: false
                                                })
                                            }
                                        }
                                    })
                                } else {
                                    if (that.data.cookies) {
                                        post_data['cookies'] = that.data.cookies
                                        post_data['captcha'] = e.detail.value.captcha
                                    }
                                    that.tylogin(post_data)
                                }
                            }
                        },
                    })
                }
            }
        })
    },

    //统一登录
    tylogin(post_data) {
        var that = this;
        util.req('login', {
            stu_id: post_data.username,
            stu_pwd: post_data.password,
        }, function (res) {
            if (res.code == 200) {
                var ty_info = res
                console.log(ty_info)
                wx.request({
                    url: util.rootUrl + 'login/',
                    data: {
                        username: post_data.username,
                        password: 'cumt2020',
                    },
                    method: 'POST',
                    success(res) {
                        var res = res.data
                        console.log(res)
                        if (res.status == 200) {
                            wx.setStorageSync(
                                'user', {
                                    'username': post_data.username,
                                    'password': post_data.password,
                                    'token': res.data[0].token,
                                })
                            wx.setStorageSync('user_info', res.data[0].user_info)
                            wx.navigateBack(-1)
                        } else if (res.status == 401) {
                            //注册用户
                            wx.request({
                                url: util.rootUrl + 'users/register/',
                                data: {
                                    'username': post_data.username,
                                    'password': 'cumt2020',
                                    'password2': 'cumt2020',
                                },
                                method: 'POST',
                                success(res) {
                                    var res = res.data
                                    console.log(res)
                                    wx.setStorageSync(
                                        'user', {
                                            'username': post_data.username,
                                            'password': post_data.password,
                                            'token': res.data.token,
                                        })
                                    var userid = res.data.user_info.id
                                    var puUrl = util.rootUrl + 'users/register/' + userid + '/'
                                    //更新用户信息
                                    wx.request({
                                        url: puUrl,
                                        data: {
                                            name: ty_info.stu_name,
                                            nickname: ty_info.stu_name,
                                            college: ty_info.stu_college,
                                            grade: ty_info.stu_class,
                                            sex: wx.getStorageSync('wx_info').gender,
                                            avatar: wx.getStorageSync('wx_info').avatarUrl,
                                            type: (post_data.username.length == 8) ? 0 : 1
                                        },
                                        method: 'PUT',
                                        header: {
                                            'Authorization': 'JWT ' + wx.getStorageSync('user').token,
                                        },
                                        success(res) {
                                            wx.setStorageSync('user_info', res.data)
                                            wx.navigateBack(-1)
                                        }
                                    })

                                }
                            })
                        }
                    }
                })
            } else {
                //登录失败
                //如果验证码出现
                if (res.cookies) {
                    var img_path = util.rootUrl2 + 'imgs/captcha/' + post_data.username + '.png?v=' + new Date().getTime()
                    that.setData({
                        captcha_path: img_path,
                        cookies: res.cookies
                    })
                }
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false
                })
            }
        })
    },

})