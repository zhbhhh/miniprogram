var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user:"189",
    userinfo_src:"/images/no_user.png",
    integral:10,
    balance:0,
    deposit:"未交",
    personalInfo:{
      myCredits:19999,
      balance:99999,
      depositStatus:"已交99999"
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     var that = this;
    wx.setNavigationBarTitle({
      title: '个人中心'
    })
    var userinfo = JSON.parse(options.userinfo);
    console.log(userinfo.skey);
    if(userinfo != ""){
      this.setData({
        userinfo_src:userinfo.avatarUrl,
        user:userinfo.nickName,
      })
    }
    // //访问接口获取积分余额信息
    // wx:wx.request({
    //   url: app.constants.ip +"/wechat/user/firstPage/personalCenter",
    //   data: {
    //     skey:userinfo.skey
    //   },
    //   header: {},
    //   method: 'POST',
    //   dataType: 'json',
    //   responseType: 'text',
    //   success: function(res) {
    //     var personalInfo = res.data.personalCenter.personalInfo;
    //     var depositStatus = "";
    //     if (personalInfo.deposit_status != null && personalInfo.deposit_status === "1"){
    //       depositStatus = "已交";
    //     }else{
    //       depositStatus = "未交";
    //     }
    //     that.setData({
    //       depositStatus: depositStatus,
    //       personalInfo:personalInfo
    //     })


    //   },
    //   fail: function(res) {},
    //   complete: function(res) {},
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
    this.setData({
      integral: 100
    });
    wx.getStorage({
      key: app.constants.userinfo,
      success: function(res) {
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
            console.log(res);
            var personalInfo = res.data.personalCenter.personalInfo;
            var depositStatus = "";
            if (personalInfo.deposit_status != null && personalInfo.deposit_status === "1") {
              depositStatus = "已交";
            } else if (personalInfo.deposit_status != null && personalInfo.deposit_status === "0"){
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
  //跳转至设置页面
  settings:function(e){
    wx.navigateTo({
      url: '/pages/settings/index',
    })
  },
  //点击我的钱包跳转到我的钱包页面
  wallet:function(e){
    var personalInfo = JSON.stringify(this.data.personalInfo);
    wx.navigateTo({
      // url: '/pages/mywallet/index?personalInfo=' + personalInfo,
      url: '/pages/mywallet/index',
    })
  },
  rechargerecord:function(e){
    wx.navigateTo({
      url: '/pages/rechargerecord/index',
    })
  },
  help:function(e){
    wx.navigateTo({
      url: '/pages/help/index',
    })
  }
})