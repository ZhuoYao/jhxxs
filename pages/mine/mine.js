// pages/my/my.js
const app = getApp()
const util = require('../../utils/util.js')
Page({
    data: {
        tabbar: {},
        avatar: [],
    },
    onLoad: function (options) {
        app.editTabbar();
    },
    onShow: function (params) {
        if (wx.getStorageSync('user_info')) {
            this.setData({
                token: wx.getStorageSync('user').token,
            })
            this.setData(wx.getStorageSync('user_info'))
            // console.log(this.data)
        }
    },
    kdkd: function () {
        wx.navigateToMiniProgram({
            appId: 'wx7f811299d8a7f86a'
        })

    },
    login_out: function () {
        wx.navigateTo({
            url: '../login/login',
        })
    },
    nicknameChange: function (e) {
        // console.log(e.detail.value)
        this.setData({
            newnickname: e.detail.value
        })
    },
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target,
            newnickname: this.data.nickname,
        })
    },
    changenick(e) {
        var that = this
        if (that.data.newnickname != that.data.nickname) {

            wx.request({
                url: util.rootUrl + 'users/msg_check',
                method: 'POST',
                data: {
                    content: that.data.newnickname
                },
                success(res) {
                    if (res.data.status == 200) {
                        var userid = wx.getStorageSync('user_info').id
                        var puUrl = util.rootUrl + 'users/register/' + userid + '/'
                        //更新用户信息
                        wx.request({
                            url: puUrl,
                            data: {
                                nickname: that.data.newnickname,
                            },
                            method: 'PUT',
                            header: {
                                'Authorization': 'JWT ' + wx.getStorageSync('user').token,
                            },
                            success(res) {
                                console.log(res.data)
                                wx.setStorageSync('user_info', res.data)
                                that.setData({
                                    modalName: null,
                                    nickname: that.data.newnickname,
                                })
                            }
                        })
                    } else {
                        wx.hideLoading({
                            complete: (res) => {},
                        })
                        wx.showModal({
                            title: '提示',
                            content: res.data.msg,
                            showCancel: false,
                            success: function (res) {

                            }
                        })
                    }
                }
            })
        } else {
            console.log(e)
            that.setData({
                modalName: null,
            })
        }


    }
})