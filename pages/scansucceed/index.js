// pages/borrowdetail/index.js
var utils = require('../../utils/util')
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
    money:1,
    freeMin:5,
    maxCost:10,
    killShake:false,
    formId1:"",
    formId2:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.checkSession();
    var q = decodeURIComponent(options.q);
    if (q) {
      // console.log("全局onLaunch onload url=" + q)
      // console.log("全局onLaunch onload 参数 flag=" + utils.getQueryString(q, 'sn'))
      var deviceNo = utils.getQueryString(q, 'sn');
      that.setData({
        deviceNo:deviceNo
      });
      // wx.showModal({
      //   title: 'sn',
      //   content: deviceNo,
      // })
      wx.showLoading({
        title: '',
        mask:true,
      })
      //访问接口获取使用充电宝的参数
      wx: wx.request({
        url: app.constants.ip + "/wechat/user/scanGetPrice",
        data: {
          deviceNO: deviceNo
        },
        header: {},
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if (res.data.code == "1") {
            that.setData({
              money: res.data.data.pricePerHour,
              freeMin: res.data.data.freeTime,
              maxCost: res.data.data.topPricePerDay,
            })
          }
          console.log(res)
        },
        fail: function (res) { },
        complete: function (res) {
          wx.hideLoading();
        },
      })
    }
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
  commit1:function(e){
    var that = this;
    that.setData({
      killShake :true,
    })
    // var r1 = that.data.formId1;
    // var r2 = that.data.formId2;
    // console.log(r1+"...................."+r2);
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) { //表示用户已登录，可进行扫码
        var userinfo = JSON.parse(res.data);
        wx.showLoading({
          title: '',
          mask:true,
        })
        //先访问接口是否正在充电，防止多次借用充电宝
        wx: wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/scanBorrow",
          data: {
            skey: userinfo.skey,
            deviceNO: that.data.deviceNo,
            formId1: that.data.formId1,
            formId2: that.data.formId2,
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            console.log(res);
            if (res.data.flag == "1" && res.data.code == "1"){ //用户可借用充电宝
              wx.redirectTo({
                url: '/pages/billing/index',
              })
              wx.showModal({
                title: '充电宝已弹出',
                content: '请及时取走您的充电宝!',
                success: function (e) {
                },
                fail: function (e) {
                  console.log(e);
                }
              })
            } else if (res.data.flag == "0" && res.data.code == "1"){  //用户不能借用充电宝，1.用户未交押金，2.用户有未支付的订单，3.用户有正在借用的订单。
              that.setData({
                killShake: false,
              })
              if(res.data.data == null || res.data.data==''){ //如果data数据为空，则表示押金未交或无充电宝可借
                if (res.data.msg === '当前充电箱无法借出充电宝'){//无充电宝可借
                  wx.showModal({
                    title: res.data.msg,
                    content: '',
                  })
                }else{  //押金未交
                  wx.redirectTo({
                    url: '/pages/deposit/index',
                  })
                }
                
              }else {
                if (res.data.data.order != undefined && res.data.data.order.powerBankStatus == "0") { //powerBankStatus=0表示正在充电
                  wx.showModal({
                    title: '借用充电宝失败',
                    content: '您有正在进行的订单',
                    success: function (e) {
                    }
                  })
                //powerBankStatus=1用户已还充电宝，payStatus=0表示有未支付
                ////powerBankStatus=1并且payStatus=0表示有未支付的订单
                } else if (res.data.data.powerBankStatus == "1" && res.data.data.payStatus=="0"){
                  if(res.data.data.payAmount != "0"){
                    wx.showModal({
                      title: '您有未支付的订单',
                      content: '是否立即支付',
                      success:function(e){
                        if (e.confirm) //用户点击了确定按钮
                        that.handleOrder(res.data.data.payAmount);
                      }
                    })
                  }
                }
              }
            } else if (res.data.flag == "0" && res.data.code == "0"){
              wx.showModal({
                title: '借出充电宝失败',
                content: res.data.msg,
              })
              that.setData({
                killShake: false,
              })
            }else{
              that.setData({
                killShake: false,
              })
              wx.showModal({
                title: res.data.msg,
                content: '',
              })
            }
          },
          fail: function (res) {
            console.log(res)
            that.setData({
              killShake: false,
            })
            wx.showToast({
              title: '借用充电宝失败，请稍后重试',
              duration:3000,
            })
           },
          complete: function (res) { 
            wx.hideLoading();
            
          },
        })

      },
      fail: function () {    //用户未登录，跳转到登录界面
        wx.navigateTo({
          url: '/pages/login/index',
        })
        that.setData({
          killShake: false,
        })
      }
    })
  },
  handleOrder:function(money){
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
                  
                  // wx.redirectTo({
                  //   url: '/pages/rechargesucced/index?amount=' + that.data.money,
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
  getQrInfo: function (options){
    console.log("全局onLaunch options==" + JSON.stringify(options))
    var q = decodeURIComponent(options.q)
    // var q = "http://www.joyfive.club/file/q?sn=1234"
    if (q) {
      // console.log("全局onLaunch onload url=" + q)
      // console.log("全局onLaunch onload 参数 flag=" + utils.getQueryString(q, 'flag'))
      
    }
    wx.showModal({
      title: q,
      content: utils.getQueryString(q, 'sn'),
    })

  },
  checkSession: function () {
    wx.checkSession({
      success: function (res) {//成功表示session_key未过期
        //未过期 则不用管
      },
      fail: function (res) {  //失败表示session_key过去，则清除存储的skey，让用户重新登录获取skey
        wx.removeStorage({
          key: app.constants.userinfo,
          success: function (res) { },
        })
      }
    })
  },
  backHome:function(res){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  //上传formId到后台，消息推送用到
  submitInfo:function(e){
    var that = this;
    var formId =e.detail.formId;
    this.data.formId2 = formId;
    console.log("submitInfo,"+formId);
    // wx.showModal({
    //   title: formId,
    //   content: that.data.formId1,
    // })
    // wx.getStorage({
    //   key: app.constants.userinfo,
    //   success: function(res) {
    //     var userinfo = JSON.parse(res.data);
    //     wx.request({
    //       url: app.constants.ip + "/wechat/user/templateMessage/publishModelMessage",
    //       data: {
    //         skey: userinfo.skey,
    //         formId1: that.data.formId1,
    //         formId2:formId,
    //       },
    //       header: {},
    //       method: 'POST',
    //       dataType: 'json',
    //       responseType: 'text',
    //       success: function (res) {
    //         console.log(res);
    //       },
    //       fail: function (res) {
    //         console.log("fail:"+res);
    //       }
    //     })
    //   },
    // })
    this.commit1();  //获取formId 后再告诉后台借用充电宝
  },
  formSubmit:function(e){
    var formId1 = e.detail.formId;
    this.data.formId1 = formId1;
  }
})