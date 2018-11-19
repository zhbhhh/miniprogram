// pages/shopdetail/index.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shop: {
      shopPosition: ["114.0226364136", "22.5737552844"],
      shopPhoto: "",
      shopStatus: 1,                         //1为营业中
      shopName: "088酒吧",
      businessTime: "02:00-00:00",
      address: "虎门镇不夜城，来玩呀",
      distance: 34,
      canBorrowNum: 8,
      canBackNum: 2,
      shopTel: "158909898909"
    },
    chargingFlag: false,
    image_src:"/images/scan.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '店铺详情',
    })
    var shop = JSON.parse(options.shop);
      this.setData({
        shop:shop
      })
      console.log(options)
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
    //访问后台接口，查询是否有正在借用的充电宝
    var that = this;
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) { //表示用户已登录，可进行扫码
        // console.log(res)
        var userinfo = JSON.parse(res.data);
        //先访问接口是否正在充电，防止多次借用充电宝
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/userStatus/doesUserHaveOrderDoing",
          data: {
            skey: userinfo.skey,
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            if (res.data.flag == "0") { //没有正在进行的订单
              that.setData({
                image_src: "/images/scan.png",
                chargingFlag: false
              })
            } else if (res.data.flag == "1") { //有正在进行的订单
              that.setData({
                 image_src: "/images/charging.png",
                 chargingFlag: true
              })
              that.startTimer();
            }
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      },
      fail: function () {    //用户未登录，跳转到登录界面

      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  
  onHide: function (e) {
    clearInterval(this.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function (e) {
    clearInterval(this.data.timer);
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
  scan_recharge:function(e){
    var that = this;
  //判断用户是否已登录
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) { //表示用户已登录，可进行扫码
        //判断是否是正在充电状态
        if (that.data.chargingFlag) { // 表示正在充电
          wx.navigateTo({
            url: '/pages/billing/index?fromHome=' + true,
          })
        } else { //没有正在充电的订单，可扫码
          wx.scanCode({
            success: function (res) {
              console.log(res)
              var url = res.result;
              wx.redirectTo({
                url: "/pages/scansucceed/index?q=" + encodeURIComponent(url),
              })
            }
          })
        }
      },
      fail: function () {    //用户未登录，跳转到登录界面
        wx.navigateTo({
          url: '/pages/login/index',
        })
      }
    })
    
  },
  navgation:function(e){
    console.log("daohang")
    var that = this;
   wx.openLocation({
     latitude: parseFloat(that.data.shop.latitude),
     longitude: parseFloat(that.data.shop.longitude),
   })
  },
  phone:function(e){
    wx.makePhoneCall({
      phoneNumber: this.data.shop.shopTel,
    })
  },
  //开启计时器
  startTimer: function (currentTime) {
    var s = 0;
    // 计时开始
    this.data.timer = setInterval(() => {
      s++;
      if (s % 5 == 0) {
        this.checkBackPowerBank();
      }
    }, 1000)
  },
  //实时访问是否归还充电宝
  checkBackPowerBank: function (e) {
    var that = this;
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) {
        var userinfo = JSON.parse(res.data);
        // wx.showLoading({
        //   title: '',
        // })
        //获取skey成功，访问接口获取数据
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/backPowerBank",
          data: {
            skey: userinfo.skey,
            // skey: "skey9876543222",
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            console.log(res)
            if (res.data.flag == "1") { //用户可借用充电宝,表示充电宝已归还
              clearInterval(that.data.timer);//清楚计时器
              //恢复扫码充电图标
              that.setData({
                image_src: "/images/scan.png",
                chargingFlag: false
              })
              //处理订单结果
              if (res.data.data.payStatus == "1") {  //表示已支付
                if (res.data.data.transactionSource == "3") {//3表示交易源为余额,4表示免费
                  wx.showModal({
                    title: '充电宝归还成功',
                    content: '本次消费' + res.data.data.payAmount + '元，已从余额扣除',
                  })
                } else if (res.data.data.transactionSource == "4") {//本次充电免费
                  wx.showModal({
                    title: '充电宝归还成功',
                    content: '本次充电免费',
                  })
                }
              } else { //表示未支付
                if (res.data.data.payAmount != "0") {
                  wx.showModal({
                    title: '充电完成',
                    content: '本次消费' + res.data.data.payAmount + '元，是否立即支付',
                    success: function (e) {
                      if (e.confirm) //用户点击了确定按钮,再调用支付接口
                        that.handleOrder(res.data.data.payAmount);
                    }
                  })
                }
              }
            } else {  //用户不能借用充电宝，1.用户未交押金，2.用户有未支付的订单，3.用户有正在借用的订单。

            }
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      },
    })
  },
  handleOrder: function (money) {
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) {
        var userinfo = JSON.parse(res.data);
        //获取skey成功，访问接口获取数据
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/personalCenter/myWallet/recharge",
          data: {
            skey: userinfo.skey,
            rechargeType: "0",  //0 表示处理支付订单
            amount: money
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            if (res.data.code == "1") {
              console.log(res);
              wx.requestPayment({
                timeStamp: res.data.data.timeStamp,
                nonceStr: res.data.data.nonceStr,
                package: res.data.data.package,
                signType: res.data.data.signType,
                paySign: res.data.data.paySign,
                success: function (e) { //支付成功
                  console.log(e)
                  // wx.navigateBack({
                  //   delta: 99
                  // })
                },
                fail: function (e) { //支付失败
                  console.log(e)
                  wx.showToast({
                    title: '支付失败',
                    duration: 2000,
                  })
                }
              })
            } else { //接口返回code=0 失败
              console.log(res);
              wx.showToast({
                title: '支付失败',
                duration: 2000
              })
            }
          },
          fail: function (res) {

          },
          complete: function (res) { },
        })
      },
    })
  },
})