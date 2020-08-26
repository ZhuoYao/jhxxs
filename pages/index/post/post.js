const util = require('../../../utils/util.js')
Page({
    data: {
        imgList: [],
        category_index: 0,
        category_list: ["个人发布", "通知公告", "失物招领"],
    },
    onLoad: function (options) {

    },
    onShow: function () {
        util.isLogin(function (res) {
            if (res.confirm) {
                wx.navigateBack(-1)
            }
        })
    },
    formSubmit: function (e) {
        // console.log(e.detail.value)
        var that = this
        var value = e.detail.value
        if (!value.content) {
            wx.showModal({
                title: '提示',
                content: '请填写动态内容',
                showCancel: false,
            })
        } else {
            //正文是否含有敏感信息
            wx.showLoading({
                title: '发布ing',
            })
            wx.request({
                url: util.rootUrl + 'users/msg_check',
                method: 'POST',
                data: {
                    content: value.content
                },
                success(res) {
                    if (res.data.status == 200) {
                        var post_data = {
                            'category': parseInt(that.data.category_index) + 1,
                            'body': value.content,
                        }
                        var token = wx.getStorageSync('user').token
                        wx.request({
                            url: util.rootUrl + 'articles/post/',
                            data: post_data,
                            method: 'POST',
                            header: {
                                'Authorization': 'JWT ' + token,
                            },
                            success: function (res) {
                                console.log(res.data)
                                if (res.data.body == value.content) {
                                    var isUpimg = true
                                    for (var i = 0; i < that.data.imgList.length; i++) {
                                        wx.uploadFile({
                                            url: util.rootUrl + 'articles/upimg/',
                                            filePath: that.data.imgList[i],
                                            name: 'img',
                                            header: {
                                                'Content-Type': 'application/x-www-form-urlencoded',
                                                'Authorization': 'JWT ' + token,
                                            },
                                            formData: {
                                                'article': res.data.id
                                            },
                                            success(res) {
                                                console.log(res.data)
                                            },
                                            fail(res) {
                                                isUpimg = false
                                                // console.log(res.data)
                                            }
                                        })
                                    }
                                    wx.hideLoading({
                                        complete: (res) => {},
                                    })
                                    wx.showModal({
                                        title: '提示',
                                        content: isUpimg ? '发布成功' : '配图发布失败',
                                        showCancel: false,
                                        success: function (res) {
                                            if (res.confirm) {
                                                wx.navigateBack(-1)
                                            }
                                        }
                                    })
                                }
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

        }
    },
    categoryChange: function (e) {
        this.setData({
            category_index: e.detail.value
        })
    },
    ChooseImage() {
        var that = this
        wx.chooseImage({
            count: 9, //默认9
            sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album'], //从相册选择
            success: (res) => {
                //图片是否含有敏感信息
                var img_path = res.tempFilePaths
                console.log(res)
                if (that.data.imgList.length != 0) {
                    that.setData({
                        imgList: that.data.imgList.concat(img_path)
                    })
                } else {
                    that.setData({
                        imgList: img_path
                    })
                }
                // wx.showLoading({
                //     title: '检查图片ing',
                // })
                // wx.uploadFile({
                //     url: util.rootUrl + 'users/img_check',
                //     filePath: img_path[0],
                //     name: 'img',
                //     header: {
                //         'Content-Type': 'application/x-www-form-urlencoded',
                //     },
                //     success(res) {
                //         console.log(res)
                //         var res = JSON.parse(res.data)
                //         if (res.status == 200) {
                //             wx.hideLoading({
                //                 complete: (res) => {},
                //               })
                //             if (that.data.imgList.length != 0) {
                //                 that.setData({
                //                     imgList: that.data.imgList.concat(img_path)
                //                 })
                //             } else {
                //                 that.setData({
                //                     imgList: img_path
                //                 })
                //             }
                //         } else {
                //             wx.hideLoading({
                //                 complete: (res) => {},
                //               })
                //             wx.showModal({
                //                 title: '提示',
                //                 content: res.msg,
                //                 showCancel: false,
                //                 success: function (res) {}
                //             })
                //         }
                //     },
                // })
            }
        });
    },
    ViewImage(e) {
        wx.previewImage({
            urls: this.data.imgList,
            current: e.currentTarget.dataset.url
        });
    },
    DelImg(e) {
        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            success: res => {
                if (res.confirm) {
                    this.data.imgList.splice(e.currentTarget.dataset.index, 1);
                    this.setData({
                        imgList: this.data.imgList
                    })
                }
            }
        })
    },
})