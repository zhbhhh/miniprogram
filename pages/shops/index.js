var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopslist:[
    ],
    noRecorde:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: '商家',
    })
    var value = options.searchValue;
    //判断是否是从搜索框跳转过来的
    if (value != '' && value != undefined){
      var value = options.searchValue;
      //去后台查询当前商家
      this.setData({
        searchValue: value
      })   
    }else{
      value = ""
    } //不是从商家跳转过来的
    
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          //访问接口获取附近商家
        })
        that.getNearbyShop(res.longitude, res.latitude,value);
      },
      fail: function (e) {
        console.log("用户拒绝授权获取地址")
        that.checkPerssion(value);
      }

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
  //返回地图首页
  home:function(e){
    wx.navigateBack({
      delta:1
    })
  },
  //点击用户按钮
  user_bind:function(e){
    wx.getStorage({
      key: app.constants.userinfo,
      success: function (res) {
        wx.redirectTo({
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
  //点击ITEM显示商家详情
  shopdetail:function(e){
    var id = e.currentTarget.id;
    //var shop = this.data.shopslist[id];
    var shop = JSON.stringify(this.data.shopslist[id]);
    console.log(shop);
    wx.navigateTo({
      url: '/pages/shopdetail/index?shop='+shop,
    })
  },
  //搜索输入框点击完成按钮时触发
  bindconfirm: function (e) {
    var that = this;
    var value = e.detail.value;
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          //访问接口获取附近商家
        })
        that.getNearbyShop(res.longitude, res.latitude, value);
      },
      fail: function (e) {
        console.log("用户拒绝授权获取地址")
        that.checkPerssion(value);
      }

    });

  },
  getNearbyShop:function(longi,lati,value){
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx: wx.request({
      url: app.constants.ip + "/wechat/user/firstPage/shop",
      data: {
        searchData: value,
        userPosition: ["" + longi, "" + lati]
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        var ss = JSON.stringify(res)
        
        
        that.setData({
          shopslist: res.data.shop.shopInfo,
          noRecorde: res.data.shop.shopInfo.length>0?false:true,
        })

      },
      fail: function (res) { },
      complete: function (res) { wx.hideLoading();},
    })
  },
  checkPerssion: function (value) {
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
                          that.getNearbyShop(res.longitude, res.latitude, value);
                        },
                        fail: function (e) {
                          console.log("用户拒绝授权获取地址")
                        }

                      });
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 1000,
                        
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
})