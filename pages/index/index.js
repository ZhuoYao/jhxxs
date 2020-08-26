// pages/group/group.js
const app = getApp()
const util = require('../../utils/util.js')
Page({
    data: {
        category_list: [{
                id: 0,
                name: "全部"
            },
            {
                id: 1,
                name: "个人发布"
            },
            {
                id: 2,
                name: "通知公告"
            },
            {
                id: 3,
                name: "失物招领"
            },
        ],
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        cardCur: 0,

        articles: [
            [
                []
            ],
            [
                []
            ],
            [
                []
            ],
            [
                []
            ]
        ],
        next: [],
        page: [],
        TabCur: 0,
        scrollLeft: 0,
        tabbar: {},
        isBottom: false,
        cardCur: 0,
        swiperList: [],
    },
    onLoad: function () {
        app.editTabbar();
        this.getbanner()
    },
    onShow: function () {
        this.getlist()
    },
    getbanner: function () {
        var that = this;
        var url = util.rootUrl + 'operation/banner/'
        wx.request({
            url: url,
            method: 'GET',
            success(res) {
                console.log(res.data)
                that.setData({
                    swiperList: res.data
                })
            }
        })
    },
    getlist: function () {
        var that = this;
        var article_temp = 'articles[' + this.data.TabCur + '][0]'
        var next_temp = 'next[' + this.data.TabCur + ']'
        var page_temp = 'page[' + this.data.TabCur + ']'
        var url = util.rootUrl
        if (this.data.TabCur == 0) {
            url += 'articles/list/'
        } else {
            url += 'articles/category/' + this.data.TabCur + '/'
        }
        wx.request({
            url: url,
            data: {
                page: 1,
            },
            method: 'GET',
            success(res) {
                console.log(res.data)
                that.setData({
                    [article_temp]: res.data.results,
                    [page_temp]: 1,
                    [next_temp]: res.data.next
                })
            }
        })
    },
    onPullDownRefresh: function () {
        this.getlist()
        wx.stopPullDownRefresh()
    },
    onReachBottom: function () {
        var that = this;
        var article_temp = 'articles[' + this.data.TabCur + '][' + this.data.page[this.data.TabCur] + ']'
        var next_temp = 'next[' + this.data.TabCur + ']'
        var page_temp = 'page[' + this.data.TabCur + ']'
        if (that.data.next[that.data.TabCur] != null) {
            wx.showLoading({
                title: '请稍后',
            })
            wx.request({
                url: that.data.next[that.data.TabCur],
                method: 'get',
                success: function (res) {
                    console.log(res.data)
                    if (that.data.TabCur == 0) {
                        that.setData({
                            [article_temp]: res.data.results,
                            [page_temp]: that.data.page[that.data.TabCur] + 1,
                            [next_temp]: res.data.next,
                        })
                    } else {
                        that.setData({
                            [article_temp]: res.data.articles.results,
                            [page_temp]: that.data.page[that.data.TabCur] + 1,
                            [next_temp]: res.data.articles.next,
                        })
                    }
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
    imgClick: function(e) {
        console.log(e)
        wx.navigateTo({
            url: 'imgDetail/imgDetail?webUrl=' + e.currentTarget.dataset.url,
        })
    },
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
        })
        var that = this
        if (!(that.data.articles[that.data.TabCur][0].length)) {
            var article_temp = 'articles[' + that.data.TabCur + '][0]'
            var next_temp = 'next[' + that.data.TabCur + ']'
            var page_temp = 'page[' + that.data.TabCur + ']'
            var url = util.rootUrl
            if (that.data.TabCur == 0) {
                url += 'articles/list/'
            } else {
                url += 'articles/category/' + that.data.TabCur + '/'
            }
            wx.request({
                url: url,
                data: {
                    page: 1
                },
                method: 'GET',
                success(res) {
                    // console.log(res.data)
                    that.setData({
                        [article_temp]: that.data.TabCur == 0 ? res.data.results : res.data.articles.results,
                        [page_temp]: 1,
                        [next_temp]: that.data.TabCur == 0 ? res.data.next : res.data.articles.next,
                    })
                }
            })
        }
    },
    detail: function (e) {
        wx.navigateTo({
            url: '/pages/index/detail/detail?id=' + e.currentTarget.dataset.id,
        })
    },
    ViewImage(e) {
        console.log(e)
        wx.previewImage({
            urls: [e.currentTarget.dataset.url.img],
            current: e.currentTarget.dataset.url.img
        });
    },
    like: function (e) {
        if (util.isLogin()) {
            var that = this
            var likes = e.currentTarget.dataset.likes
            var index = e.currentTarget.dataset.index
            var article_temp = 'articles[' + this.data.TabCur + '][' + (this.data.page[this.data.TabCur] - 1) + ']' + '[' + index + '].likes'
            // console.log(article_temp)
            wx.request({
                url: util.rootUrl + 'operation/article_like/',
                data: {
                    article: e.currentTarget.dataset.id
                },
                method: 'post',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'JWT ' + wx.getStorageSync('user').token,
                },
                success: function (res) {
                    console.log(res)
                    if (res.data.id > 0) {
                        that.setData({
                            [article_temp]: likes + 1
                        })
                    } else {
                        that.setData({
                            [article_temp]: likes - 1
                        })
                    }
                },
                complete() {
                    wx.hideLoading()
                }
            })
        }
    },
    onShareAppMessage() {
        return {
            title: '镜湖新鲜事',
            //   imageUrl: '/images/share.jpg',
            path: '/pages/index/index'
        }
    },

})