// pages/wallet/wallet.js
var app =getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    amountList: [
      1, 5, 10, 20
    ],
    curSelected: '0',
    killShake:false,
  },
  selectAmount: function (e) {
    var dataId = e.target.dataset.id;
    console.log(dataId)
    this.setData({
      curSelected: dataId
    })
  },
  toPay: function () {
    //调用香帅接口获取支付订单
    var that = this;
    that.setData({
      amount: that.data.amountList[that.data.curSelected],
      killShake: true,   //防止按键重复点击
    })
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) {
        var userinfo = JSON.parse(res.data);
        //获取skey成功，访问接口获取数据
        wx.showLoading({
          title: '',
          mask:true,
        })
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/personalCenter/myWallet/recharge",
          data: {
            skey: userinfo.skey,
            rechargeType:"1" ,  //1 表示余额充值
            amount: that.data.amountList[that.data.curSelected]
           },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            if(res.data.code == "1"){
              console.log(res);
              wx.requestPayment({
                timeStamp: res.data.data.timeStamp,
                nonceStr: res.data.data.nonceStr,
                package: res.data.data.package,
                signType: res.data.data.signType,
                paySign: res.data.data.paySign,
                success:function(e){
                  console.log(e)
                  // wx.redirectTo({
                  //   url: '/pages/rechargesucced/index?amount='+that.data.amount,
                  // })
                  wx.navigateBack({
                    delta:99
                  })
                  that.setData({  //防止按键重复点击
                    killShake: false,
                  })
                },
                fail:function(e){
                  console.log(e)
                  wx.showToast({
                    title: '充值失败',
                    duration:2000,
                  })
                  that.setData({  //防止按键重复点击
                    killShake: false,
                  })
                }
              })
            }else{
              console.log(res);
              wx.showModal({
                title: '支付失败',
                content: res.data.msg,
              })
              that.setData({  //防止按键重复点击
                killShake: false,
              })
            }
          },
          fail: function (res) {
            that.setData({  //防止按键重复点击
              killShake: false,
            })
          },
          complete: function (res) { wx.hideLoading()},
        })
      },
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '充值',
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

})