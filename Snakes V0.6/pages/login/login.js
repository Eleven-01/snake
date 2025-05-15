// pages/login/login.js
//引入MD5加密工具
const md5 = require('../../utils/md5');
//服务器地址
const baseUrl = 'http://192.168.0.137/'

Page({
    /**
     * 页面的初始数据
     */
    data: {
        loading: false
    },

    /**
    *自定义函数——封装提示语句
    */
    showModal: function (msg) {
        wx.showModal({
            title: '提示',
            content: msg,
            showCancel: false
        })
    },

    // 表单提交
    formSubmit(e) {
        this.setData({ loading: true })
        let info = e.detail.value
        //获取用户名
        let username1 = info.username
        //获取密码
        let password1 = info.password
        //验证不为空
        if (username1 == "" || password1 == "") {
            this.showModal("用户名或密码不能为空！")
            this.setData({ loading: false })
            return
        }

        // 调用登录接口
        wx.request({
            url: baseUrl + 'checkLogin.php',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                username1: username1,
                password1: md5(password1)
            },
            success: (res) => {
                if (res.data.status_code == 1) {
                    // console.log(res.data.status_code)
                    wx.redirectTo({
                        url: '/pages/index/index'
                    })
                } else {
                    // console.log(res.data.status_code)
                    this.showModal('账号或密码错误！')
                }
            },
            fail: () => {
                wx.showToast({ title: '网络错误', icon: 'none' })
            },
            complete: () => {
                this.setData({ loading: false })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})