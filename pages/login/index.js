
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logo:"/images/app_logo.png",
    jj:"1111111111111111111"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  weixinlogin:function(e){
    
    var that = this;


    wx.getUserInfo({
      success: function (res) {
        var userinfoTemp ={
          avatarUrl:res.userInfo.avatarUrl,
          skey:"",
          nickName:res.userInfo.nickName
        }
        // var userinfo =  JSON.stringify(userinfoTemp);
        //用户同意授权，调用接口登录
        that.userLogin(userinfoTemp);

        // wx.redirectTo({
        //   url: '/pages/userinfo/index?userinfo='+userinfo,
        // })
        // wx.setStorage({
        //   key: app.constants.userinfo,
        //   data: userinfo,
        // })
      },
      fail:function(res){
        console.log(res);
        
      }
    })

    /*wx.request({
      url: 'http://192.168.0.102:8080/test?name=zxw&zhb=zhb',
      data: {
        zhb:this.data.jj,
        zxw:"oipoopopo"
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: (res) => {
       
        console.log(res);
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })*/

  },
  userLogin:function(userinfo){
    var that = this;
    wx.showLoading({
      title: '登录中......',
    })
    wx.login({
      success: function (res) {
        var code = res.code;

       // 获取code成功，调用接口登录，获取skey
        wx: wx.request({
          // url: 'https://www.qdtechwx.com/wechat/user/firstPage/loginUser',
          url: app.constants.ip +"/wechat/user/firstPage/loginUser",
          data: {
            code: code
          },
          header: {},
          method: 'POST',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            //存储skey和用户信息
            var jj = res.data.loginUser.skey;

            userinfo.skey = res.data.loginUser.skey;
         
            var user = JSON.stringify(userinfo);
            

            wx.setStorage({
              key: app.constants.userinfo,
              data: user
            })
            
            //登录成功跳转至个人中心
            wx.redirectTo({
              url: '/pages/index/index',
              // url: '/pages/userinfo/index?userinfo=' + user,
            })
            wx.showModal({
              title: '恭喜您',
              content: '登录成功',
            })
          },
          fail: function (res) { //登录失败，提醒用户登录失败
            wx.showModal({
              title: '',
              content: '登录失败',
            })
          },
          complete: function (res) { wx.hideLoading(); },
        })
        // console.log(code);
      },
      fail: function (res) { 
        
      },
      complete: function (res) { },
    })
  }

})