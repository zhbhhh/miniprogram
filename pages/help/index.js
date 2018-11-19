// pages/animationtest/index.js
var app = getApp();
Page({
  data: {
    preId:-1,
    questions:[
      {
        title:"支持手机型号",
        content:"充电宝自带4根数据线，支持安卓，苹果，Type-C口的手机及电子产品，如果您自带了充电线，充电宝上面的USB接线口可以直接使用"
      },
      {
        title: "押金规则",
        content: "押金充值：第一次使用需要充值100元。押金退款：如果有未归还的充电宝时，不能进行提现操作。归还充电宝后，可随时押金提现，约0-7个工作日退还到充值账户"
      },
      {
        title: "借出的充电宝时坏的怎么办",
        content: "如果您借出的充电宝出现充电线损坏或者无法充电灯情况，可以报错充电宝，归还到机柜。"
      },
      {
        title: "能否借多个充电宝",
        content: "暂时不支持"
      },
      {
        title: "充电宝插不进机柜卡槽内",
        content: "可能设备场地网络稳定不好，可以扫码机柜二维码报错，客服介入解决"
      }, {
        title: "如何借",
        content: "扫描Q电机箱上的二维码，扫描成功后进入Q电小程序，使用微信一键登录后，充值押金99元，就可以使用啦！"
      }, {
        title: "如何归还充电宝",
        content: "【如何归还】充电宝直接插入Q电空槽 【在哪归还】 在任意Q电的合作点"
      }

    ],
    openid:-2,
    actionSheetHidden: true,
    actionSheetItems: [
      { bindtap: 'Menu1', txt: '185 6537 1905' },
      { bindtap: 'Menu2', txt: '呼叫' },
    ],
    menu: ''
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '使用帮助'
    })
  },
  
  //点击选择类型
  clickitem:function(e) {
    var id = e.currentTarget.id;
    if(this.data.preId === id){
      this.setData({
        openid:-1,
        preId:-1
      })
      return;
    }
    this.setData({
      openid:id,
      preId:id
    })
    
  },
  actionSheetTap: function () {
    wx.makePhoneCall({
      phoneNumber: app.constants.serverPhoneNo,
    })
  },

})