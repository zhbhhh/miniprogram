var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money:0,
    rechargemoney:0,
    presentmoney:0

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this;
    // var totalBalance = options.totalBalance;
    wx.setNavigationBarTitle({
      title: '余额',
    })
    // this.setData({
    //   totalBalance: totalBalance
    // })
    
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
    var that = this;
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) {
        var userinfo = JSON.parse(res.data);

        //获取skey成功，访问接口获取数据
        wx.showLoading({
          title: '',
        })
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/personalCenter/myWallet",
          data: {
            skey: userinfo.skey,
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            console.log(res);
            var myWallet = res.data.myWalletPage.myWallet;
            var total = parseInt(myWallet.recharge_balance) + parseInt(myWallet.balance_gived);
            that.setData({
              myWallet: myWallet,
              totalBalance: total,
            })
          },
          fail: function (res) { },
          complete: function (res) {wx.hideLoading() },
        })
      },
    })
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
    
  },
  recharge:function(e){
    //调用后台支付接口
    console.log("充值");
    wx.navigateTo({
      url: '/pages/charge/index',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  rechargeprotocol:function(e){
    //webView显示文档
    console.log("充值协议");
  }
})