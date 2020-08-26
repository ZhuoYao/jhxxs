//app.js
const util = require('utils/util.js')
App({
	onLaunch: function () {
		//隐藏系统tabbar
		wx.hideTabBar();
		//获取设备信息
		wx.getSystemInfo({
			success: e => {
				this.globalData.StatusBar = e.statusBarHeight;
				this.globalData.systemInfo = e;
				let custom = {
					width: 80,
					height: 30,
					left: e.windowWidth - 12 - 80,
					right: e.windowWidth - 12,
					top: e.statusBarHeight + 10,
					bottom: e.statusBarHeight + 10 + 30
				};
				this.globalData.Custom = custom;
				this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
				var model = e.model
				if ((model.search('iPhone X') & model.search('iPhone 11')) != -1) {
					this.globalData.isIphoneX = true
				}

			}
		})

		// 登录
		wx.login({
			success: res => {
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				console.log(res)
			}
		})
		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							// 可以将 res 发送给后台解码出 unionId
							this.globalData.userInfo = res.userInfo

							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (this.userInfoReadyCallback) {
								this.userInfoReadyCallback(res)
							}
						}
					})
				}
			}
		})
		if (wx.getStorageSync('user')) {
			var username = wx.getStorageSync('user').username
			var password = wx.getStorageSync('user').password
			if (username.length != 6) {
				password = 'cumt2020'
			}
			wx.request({
				url: util.rootUrl + 'login/',
				data: {
					username: username,
					password: password,
				},
				method: 'POST',
				success(res) {
					var res = res.data
					console.log(res)
					if (res.status == 200) {
						wx.setStorageSync(
							'user', {
								'username': username,
								'password': password,
								'token': res.data[0].token,
							})
						wx.setStorageSync('user_info', res.data[0].user_info)
					}
				}
			})
		}
	},
	onShow: function () {
		//隐藏系统tabbar
		wx.hideTabBar();
	},

	editTabbar: function () {
		let tabbar = this.globalData.tabBar;
		let currentPages = getCurrentPages();
		let _this = currentPages[currentPages.length - 1];
		let pagePath = _this.route;
		(pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
		for (let i in tabbar.list) {
			tabbar.list[i].selected = false;
			(tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
		}
		_this.setData({
			tabbar: tabbar
		});
	},
	globalData: {
		systemInfo: null, //客户端设备信息
		userInfo: null,
		isIphoneX: false
	}
})