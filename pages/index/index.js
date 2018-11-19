//index.js
//获取应用实例
var app = getApp()
var utils = require('../../utils/util')
Page({
  data: {
    scale: 18,
    latitude: 0,
    longitude: 0,
    markers:[],
    shops: [],
    shop:{},
    shopdetailhide:false,
    chargingFlag:false,
  },
// 页面加载
  onLoad: function (options) {
    //检测Session_key是否过期
    this.checkSession();
    // if(options.q){
    //   var q = options.q;
    //   wx.navigateTo({
    //     url: '/pages/scansucceed/index?q='+q,
    //   })
    //   return;
    // }
    var that = this;
    // 2.获取并设置当前位置经纬度
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          //访问接口获取附近商家
        })
        that.getNearbyShop(res.longitude, res.latitude);
      },
      fail:function(e){
        console.log("用户拒绝授权获取地址")
        that.checkPerssion();
      }

    });

    //console.log(this.data.markers)
   
    // 3.设置地图控件的位置及大小，通过设备宽高定位
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          controls: [{
            id: 1,
            iconPath: '/images/location.png',
            position: {
              left: 20,
              top: res.windowHeight*0.9 - 80,
              width: 50,
              height: 50
            },
            clickable: true
          },
          {
            id: 2,
            iconPath: '/images/scan.png',
            position: {
              left: res.windowWidth/2 - 77,
              top: res.windowHeight*0.9 - 80,
              width: 154,
              height: 50
            },
            clickable: true
          },
          {
            id: 3,
            iconPath: '/images/service.png',
            position: {
              left: res.windowWidth - 70,
              top: res.windowHeight * 0.9 - 80,
              width: 50,
              height: 50
            },
            clickable: true
          },
          {
            id: 4,
            iconPath: '/images/marker.png',
            position: {
              left: res.windowWidth/2 - 11,
              top: res.windowHeight / 2 * 0.9 - 32,
              width: 21,
              height: 32
            },
            clickable: true
          },
            {
              id: 5,
              iconPath: '/images/guide.png',
              position: {
                left: res.windowWidth-85,
                top: 20,
                width: 85,
                height: 35
              },
              clickable: true
            }

          ]
        })
      }
    });
  },
  onReady:function(){
    this.mapCtx = wx.createMapContext("xhcharging");
    // this.movetoPosition()
  },
  onUnload:function(e){
    clearInterval(this.data.timer);
  },
  onHide:function(e){
    clearInterval(this.data.timer);
  },
// 页面显示
  onShow: function(){
    //访问后台接口，查询是否有正在借用的充电宝
    app.checkVersion();
    var that = this;
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) { //表示用户已登录，可进行扫码
      // console.log(res)
        var userinfo = JSON.parse(res.data);
        //先访问接口是否正在充电，防止多次借用充电宝
        wx:wx.request({
          url: app.constants.ip + "/wechat/user/firstPage/userStatus/doesUserHaveOrderDoing",
          data: {
            skey:userinfo.skey,
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function(res) {
            if (res.data.flag == "0") { //没有正在进行的订单
              var cc = that.data.controls;
              cc[1].iconPath = "/images/scan.png";
              that.setData({
                controls: cc,
                chargingFlag: false
              })
              that.checkOrder(userinfo.skey);
            } else if (res.data.flag == "1") { //有正在进行的订单
              var cc = that.data.controls;
                  cc[1].iconPath = "/images/charging.png";
                  that.setData({
                    controls: cc,
                    chargingFlag:true
                  })
                  that.startTimer();
            }
          },
          fail: function(res) {},
          complete: function(res) {},
        })
        // wx: wx.request({
        //   url: app.constants.ip + "/wechat/user/firstPage/scanBorrow",
        //   data: {
        //     skey: userinfo.skey,
        //   },
        //   header: {},
        //   method: 'POST',
        //   dataType: 'json',
        //   responseType: 'text',
        //   success: function (res) {
        //     console.log(res)
        //     if (res.data.flag == "1" && res.data.code == "1") { //用户可借用充电宝
        //       var cc = that.data.controls;
        //       cc[1].iconPath = "/images/scan.png";
        //       that.setData({
        //         controls: cc,
        //         chargingFlag: false
        //       })
        //     } else {  //用户不能借用充电宝，1.用户未交押金，2.用户有未支付的订单，3.用户有正在借用的订单。
        //       if (res.data.data == null || res.data.data == '') { //如果data数据为空，则表示押金未交
               
        //       } else {
        //         if (res.data.data.order.powerBankStatus == "0") { //powerBankStatus=0表示正在充电
        //           var cc = that.data.controls;
        //           cc[1].iconPath = "/images/charging.png";
        //           that.setData({
        //             controls: cc,
        //             chargingFlag:true
        //           })
        //           that.startTimer();
        //           ////powerBankStatus=1并且payStatus=0表示有未支付的订单
        //         } else if (res.data.data.order.powerBankStatus == "1" && res.data.data.order.payStatus == "0") {
                  
        //         }
        //       }
        //     }
        //   },
        //   fail: function (res) { },
        //   complete: function (res) { },
        // })

      },
      fail: function () {    //用户未登录，跳转到登录界面
        
      }
    })
  },

// 地图控件点击事件
  bindcontroltap: function(e){
    var that = this;
    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
    switch(e.controlId){
      // 点击定位控件
      case 1: this.movetoPosition();
        break;
      // 点击立即用车，判断当前是否正在计费
      case 2:
      //点击按钮时，判断网络是否正常
        if (!app.data.networkStatus){
          wx.showModal({
            title: '当前无网络',
            content: '请检查您的网络连接！',
          })
          return;
        }
      //判断用户是否已登录
        wx.getStorage({
          key: app.constants.userinfo,
          success: function (res) { //表示用户已登录，可进行扫码
            //判断是否是正在充电状态
            if (that.data.chargingFlag){ // 表示正在充电
              wx.navigateTo({
                url: '/pages/billing/index?fromHome='+true,
              })
            }else{ //没有正在充电的订单，可扫码
              wx.scanCode({
                success:function(res){
                  // console.log(res)
                  var url = res.result;
                  var deviceNo = utils.getQueryString(url, 'sn');
                  if(deviceNo == null){
                    wx.showModal({
                      title: '非法的二维码',
                      content: '',
                    })
                    return;
                  }
                  wx.navigateTo({
                    url: "/pages/scansucceed/index?q="+encodeURIComponent(url),
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

        break;
      // 点击保障控件，跳转到报障页
      case 3: 
        //点击按钮时，判断网络是否正常
        if (!app.data.networkStatus) {
          wx.showModal({
            title: '当前无网络',
            content: '请检查您的网络连接！',
          })
          return;
        }
        //获取本地登录缓存，如未登录 跳转至登录页面
        wx.getStorage({
          key: app.constants.userinfo,
          success: function(res) { //已登录
            if(res.data != '' || res.data != undefined){
              wx.navigateTo({
                url: '../warn/index'
              });
            }
          },
          fail:function(){  //未登录
            wx.navigateTo({
              url: '/pages/login/index',
            })
          }
        })
        break;
      default: break;
    }
  },
// 地图视野改变事件
  bindregionchange: function(e){
    var that = this;
    // 拖动地图，获取附件单车位置
    if(e.type == "begin"){
      
    // 停止拖动，显示单车位置
    }else if(e.type == "end"){
      //访问接口显示附近地址
      this.mapCtx.getCenterLocation({
        success: function (res) {
          that.getNearbyShop(res.longitude,res.latitude);
        }
      });
    }
  },
// 地图标记点击事件，显示商户详细信息
  bindmarkertap: function(e){
    console.log(e);
    let markerId = e.markerId;
    this.setData({
      shop:this.data.shops[markerId],
      
      shopdetailhide:true,
    })
  },
// 定位函数，移动位置到地图中心
  movetoPosition: function(){
    this.mapCtx.moveToLocation();
  },
  clickmap:function(e){
    this.setData({
      shopdetailhide:false
    })
  },
  clickshop:function(e){
    this.setData({
      shopdetailhide: false
    })
    var shop = JSON.stringify(this.data.shop);
    wx.navigateTo({
      url: '/pages/shopdetail/index?shop=' + shop,
    })
  },
  //检查是否有地图权限
  checkPerssion: function (e) {
    var that = this;
    wx.getSetting({//先获取用户当前的设置
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.showModal({
            title: '是否授权当前位置',
            content: '“Q电”要获取你的地理位置，请确认授权，否则地图功能将无法使用，是否允许?',
            success: function (e) {
              if (e.confirm) {
                wx.openSetting({
                  success: function (data) {
                    if (data.authSetting["scope.userLocation"] === true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //授权成功，再次获取经纬度
                      wx.getLocation({
                        type: "gcj02",
                        success: (res) => {
                          that.setData({
                            longitude: res.longitude,
                            latitude: res.latitude,
                            //访问接口获取附近商家
                          })
                          that.getNearbyShop(res.longitude, res.latitude);
                        },
                        fail: function (e) {
                          console.log("用户拒绝授权获取地址")
                        }

                      });
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  }
                })
              } else {
                  //用户点击取消 不做处理
              }
              console.log(e);
            }
          })
        } else {
          console.log("用户拒绝")
        }
      }
    })
  },
  showMarkers:function(e){
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          // longitude: res.longitude,
          // latitude: res.latitude,
          markers: [
            {
              iconPath: "/images/markers.png",
              id: 0,
              longitude: 113.836008,
              latitude: 22.631886,
              width: 37,
              height: 42
            },
            {
              iconPath: "/images/markers.png",
              id: 1,
              longitude: 113.836134,
              latitude: 22.631067,
              width: 37,
              height: 42
            },
            {
              iconPath: "/images/markers.png",
              id: 2,
              longitude: 113.832367,
              latitude: 22.637827,
              width: 37,
              height: 42
            },
            {
              iconPath: "/images/markers.png",
              id: 3,
              longitude: 113.832367,
              latitude: 22.632312,
              width: 37,
              height: 42
            },
            {
              iconPath: "/images/markers.png",
              id: 4,
              longitude: 113.836525,
              latitude: 22.631915,
              width: 37,
              height: 42
            }
          ]
        })
      },
    });
  },
  //点击user图标跳转到me界面
  user_bind: function (e) {
    //点击按钮时，判断网络是否正常
    if (!app.data.networkStatus) {
      wx.showModal({
        title: '当前无网络',
        content: '请检查您的网络连接！',
      })
      return;
    }
    //获取登录缓存，决定跳转页面
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) {
        wx.navigateTo({
          url: '/pages/userinfo/index?userinfo=' + res.data,
        })
      },
      fail: function () {
        wx.navigateTo({
          url: '/pages/login/index',
        })
      }
    })

  },
  //点击跳转至附近商家页面
  nearby_bind: function (e) {
    //点击按钮时，判断网络是否正常
    if (!app.data.networkStatus) {
      wx.showModal({
        title: '当前无网络',
        content: '请检查您的网络连接！',
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/shops/index',
    })
  },
  //搜索输入框点击完成按钮时触发
  bindconfirm:function(e){
    //点击按钮时，判断网络是否正常
    if (!app.data.networkStatus) {
      wx.showModal({
        title: '当前无网络',
        content: '请检查您的网络连接！',
      })
      return;
    }
    var value = e.detail.value;
    wx.navigateTo({
      url: '/pages/shops/index?searchValue='+value,
    })

  },
  checkSession:function(){
    wx.checkSession({
      success:function(res){//成功表示session_key未过期
        //未过期 则不用管
      },
      fail:function(res){  //失败表示session_key过去，则清除存储的skey，让用户重新登录获取skey
        wx.removeStorage({
          key: app.constants.userinfo,
          success: function(res) {},
        })
      }
    })
  },
  getNearbyShop: function (longitude, latitude){
    // 4.请求服务器，显示附近的充电宝箱的商家，用marker标记
    var that = this;
    wx: wx.request({
      // url: 'https://www.qdtechwx.com/wechat/user/firstPage',
      url: app.constants.ip + "/wechat/user/firstPage",
      data: {
        userPosition: [longitude + "", latitude+""]
      },
      header: {
        "content-type": "application/json"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {

        // var ss = JSON.stringify(res)
        console.log(res)
        if(res.data.firstPage.shopInfo == undefined){
          return;
        }
        var shops = res.data.firstPage.shopInfo;
        var m = [];

        for (var i = 0; i < res.data.firstPage.shopInfo.length; i++) {
          var s = {
            iconPath: "/images/markers.png",
            id: i,
            longitude: shops[i].longitude,
            latitude: shops[i].latitude,
            width: 37,
            height: 42
          }
          m.push(s);
        }
        that.setData({
          markers: m,
          shops: shops
        })
      },
      fail: function (res) {
        console.log("香帅接口失败" + res)
      },
      complete: function (res) { },
    })
  },
  //开启计时器
  startTimer: function (currentTime) {
    var s = 0;
    //先结束已开启的定时器
    if(this.data.timer != ''){
      clearInterval(this.data.timer);
    }
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
              var cc = that.data.controls;
              cc[1].iconPath = "/images/scan.png";
              that.setData({
                controls: cc,
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
  checkOrder:function(skey){
    var that = this;
    wx: wx.request({
      url: app.constants.ip + "/wechat/user/firstPage/userStatus/doesUserHaveOrderUnpaid",
      data: {
        skey: skey,
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        // console.log(res);
        if (res.data.flag == "0") { //没有欠费的订单，即可退押金
          
        } else if (res.data.flag == "1") { //有欠费的订单，调起支付接口
          
          wx.showModal({
            title: '温馨提示',
            content: '您有未支付的订单,是否立即支付',
            success: function (e) {
              if (e.confirm) { //用户点击了确定按钮
                that.handleOrder(res.data.data.payAmount);
              } else {
                that.setData({
                  killShake: false,
                })
              }
            }
          })

        }
      },
      fail: function (res) {
        wx.hideLoading();
        that.setData({
          killShake: false,
        })
      },
      complete: function (res) {
      },
    })
  }



})
