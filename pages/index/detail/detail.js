// pages/group/comments/comments.js
const util = require('../../../utils/util.js')
Page({
    data: {
        InputBottom: 0,
        comments: [],
    },

    onLoad: function (options) {
        var that = this
        var url = util.rootUrl + 'articles/list/' + options.id + '/'
        var comments_temp = 'comments[0]'
        wx.request({
            url: url,
            data: {},
            method: 'GET',
            success(res) {
                console.log(res)
                var res = res.data
                that.setData({
                    article: res,
                    [comments_temp]: res.comments.results,
                    next: res.comments.next,
                    images: res.images,
                    page: 1,
                })
            }
        })
    },
    onShow: function () {

    },
    onReachBottom: function () {
        var that = this;
        var comments_temp = 'comments[' + this.data.page + ']'
        if (this.data.next != null) {
            wx.showLoading({
                title: '请稍后',
            })
            wx.request({
                url: that.data.next,
                method: 'get',
                success: function (res) {
                    console.log(res.data)
                    var res = res.data
                    that.setData({
                        [comments_temp]: res.comments.results,
                        next: res.comments.next,
                        page: that.data.page + 1,
                    })

                },
                complete() {
                    wx.hideLoading()
                }
            })
        } else {
            //数据到底
            that.setData({
                isBottom: true,
            })
        }
    },
    messageChange: function (e) {
        // console.log(e.detail.value)
        this.setData({
            message: e.detail.value
        })
    },
    reply: function (e) {
        console.log(e.currentTarget.dataset)
        if (e.currentTarget.dataset.parent) {
            this.setData({
                //点击第几页的评论
                c_page: e.currentTarget.dataset.page,
                parent: [e.currentTarget.dataset.parent],
                children: null,
                parent_index: e.currentTarget.dataset.parent_index,
                children_index: null,
            })
        } else if (e.currentTarget.dataset.children) {
            this.setData({
                c_page: e.currentTarget.dataset.page,
                parent: null,
                children: [e.currentTarget.dataset.children],
                parent_index: e.currentTarget.dataset.parent_index,
                children_index: e.currentTarget.dataset.children_index,
            })
        } else {
            this.setData({
                c_page: null,
                parent: null,
                children: null,
                parent_index: null,
                children_index: null,
            })
        }
    },
    comment: function (e) {
        if (util.isLogin()) {
            var that = this
            if (!this.data.message) {
                wx.showModal({
                    title: '提示',
                    content: '请填写评论',
                    showCancel: false,
                })
            } else {
                wx.request({
                    url: util.rootUrl + 'users/msg_check',
                    method: 'POST',
                    data: {
                        content: that.data.message
                    },
                    success(res) {
                        if (res.data.status == 200) {
                            //如果有父评论则为父评论， 否则子评论 没有则[]
                            var children = that.data.parent ? that.data.parent : (that.data.children ? that.data.children : [])
                            var post_data = {
                                'article': that.data.article.id,
                                'children': children,
                                'body': that.data.message,
                            }
                            wx.request({
                                url: util.rootUrl + 'comments/reply/',
                                data: post_data,
                                method: 'post',
                                header: {
                                    'Authorization': 'JWT ' + wx.getStorageSync('user').token,
                                },
                                success(res) {
                                    console.log(res.data)
                                    if (res.data.code == 201) {
                                        wx.showModal({
                                            title: '提示',
                                            content: '评论成功',
                                            showCancel: false,
                                            success: function (res) {
                                                if (res.confirm) {
                                                    that.onLoad(that.data.article)
                                                    that.setData({
                                                        message: null,
                                                    })
                                                }
                                            }
                                        })
                                    }
                                },
                            })
                        } else {
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
        }
    },
    ViewImage(e) {
        console.log(e)
        wx.previewImage({
            urls: [e.currentTarget.dataset.url.img],
            current: e.currentTarget.dataset.url.img
        });
    },
    //输入框浮动
    InputFocus(e) {
        this.setData({
            InputBottom: e.detail.height
        })
    },
    InputBlur(e) {
        this.setData({
            InputBottom: 0
        })
    }

})