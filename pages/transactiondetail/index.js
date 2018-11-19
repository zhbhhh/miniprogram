var app = getApp();
// pages/transactiondetail/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    transactionList:[],
    showLoadingMore:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) { //表示用户已登录，可进行扫码
        var userinfo = JSON.parse(res.data);
        wx.showLoading({
          title: '',
        })
        wx.showLoading({
          title: '',
        })
        //先访问接口是否正在充电，防止多次借用充电宝
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/personalCenter/myWallet/transactionDetail",
          data: {
            skey: userinfo.skey,
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            console.log(res);
            that.setData({
              transactionList:res.data.data
            })
          },
          fail: function (res) {
            console.log(res)
          },
          complete: function (res) { wx.hideLoading() },
        })

      },
      fail: function () {    //用户未登录，跳转到登录界面
        wx.navigateTo({
          url: '/pages/login/index',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var t = getCurrentPages()
    // console.log(t[0].);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})