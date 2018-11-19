var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    integral:0,
    deposit:"未交！"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var personalInfo = JSON.parse(options.personalInfo);
    // var depositStatus ="";
    // if (personalInfo.deposit_status === "1") {
    //   depositStatus = "已交";
    // } else {
    //   depositStatus = "未交";
    // }
    // this.setData({
    //   personalInfo: personalInfo,
    //   depositStatus: depositStatus
    // })
    wx.setNavigationBarTitle({
      title:"我的钱包"
    });
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
    var that =this;
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) {
        var userinfo = JSON.parse(res.data);
        //访问接口获取积分余额信息
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/personalCenter",
          data: {
            skey: userinfo.skey
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            var personalInfo = res.data.personalCenter.personalInfo;
            var depositStatus = "";
            if (personalInfo.deposit_status != null && personalInfo.deposit_status === "1") {
              depositStatus = "已交";
            } else if (personalInfo.deposit_status != null && personalInfo.deposit_status === "0") {
              depositStatus = "未交";
            } else if (personalInfo.deposit_status != null && personalInfo.deposit_status === "2") {
              depositStatus = "正在退款";
            }
            that.setData({
              depositStatus: depositStatus,
              personalInfo: personalInfo
            })


          },
          fail: function (res) { },
          complete: function (res) { },
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
  balance:function(e){
    wx.navigateTo({
      url: '/pages/balance/index?totalBalance=' + this.data.personalInfo.account_balance,
    })
  },
  deposit:function(e){
    wx.navigateTo({
      url: '/pages/deposit/index?depositStatus=' + this.data.personalInfo.deposit_status,
    })
  },
  rechargerecord:function(e){
    wx.navigateTo({
      url: '/pages/transactiondetail/index',
    })
  }
})