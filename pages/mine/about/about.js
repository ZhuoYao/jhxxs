// pages/setting/about/about.js
Page({
    data: {
        show:false
    },
    onLoad: function(options) {

    },
    more: function() {
        this.setData({
            show: !this.data.show
        })
    },
    onShareAppMessage: function(res) {
        return {
            title: '口袋矿大',
            path: "pages/home/home",
        }
    },

})