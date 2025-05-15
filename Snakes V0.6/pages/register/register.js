// pages/register/register.js
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

    // 输入验证
    validateInput() {
        let valid = true
        const { username, password } = this.data

        // 账号验证
        if (!username || username.length < 6) {
            this.setData({ usernameError: '账号需至少6位字符' })
            valid = false
        } else {
            this.setData({ usernameError: '' })
        }

        // 密码验证
        if (!password || password.length < 8) {
            this.setData({ passwordError: '密码需至少8位字符' })
            valid = false
        } else {
            this.setData({ passwordError: '' })
        }

        this.setData({ canSubmit: valid })
        return valid
    },

    // 表单提交
    formSubmit(e) {
        this.setData({ loading: true })
        let info = e.detail.value
        //获取用户名
        let username1 = info.username
        //获取密码
        let password1 = info.password
        
        // 调用注册接口
        wx.request({
            url: baseUrl + 'register.php',
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
                    wx.showModal({
                        title: '提示',
                        content: '注册成功,前往登录！',
                        showCancel: false,
                        success(res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/login/login'
                                })
                            }
                        }
                    })
                } else {
                    // console.log(res.data.status_code)
                    this.showModal('该账号已存在！')
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

    onUsernameInput(e) {
        this.setData({ username: e.detail.value })
        this.validateInput()
    },

    onPasswordInput(e) {
        this.setData({ password: e.detail.value })
        this.validateInput()
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