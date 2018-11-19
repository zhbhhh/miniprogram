// pages/wallet/index.js
var utils = require('../../utils/util');
const AV = require('../../utils/av-weapp-min.js'); 
var app = getApp();
Page({
  data:{
    // 故障车周围环境图路径数组
    picUrls: [],
    // 故障车编号和备注
    inputValue: {
      num: 0,
      desc: ""
    },
    // 故障类型数组
    checkboxValue: [],
    // 选取图片提示
    actionText: "拍照/相册",
    // 提交按钮的背景色，未勾选类型时无颜色
    btnBgc: "",
    // 复选框的value，此处预定义，然后循环渲染到页面
    faultimage: "/images/add_photo.png",
    click1: false,
    click2: false,
    click3: false,
    click4: false,
    click5: false,
    faultreason:[],
    //设备故障窗口
    numlist:[
      {
        num:1,
        check:false
      },
      {
        num: 2,
        check: false
      },
      {
        num: 3,
        check: false
      },
      {
        num: 4,
        check: false
      },
      {
        num: 5,
        check: false
      },
      {
        num: 6,
        check: false
      },
      {
        num: 7,
        check: false
      },
      {
        num: 8,
        check: false
      },
      {
        num: 9,
        check: false
      },
      {
        num: 10,
        check: false
      }
    ],
    //设备故障类型
    faultnum:[],
    inputcount:0,
    commitdis:true,
    describe:"",
    photoFilePath:"",
    chargingboxno:"",
    scan_type:false,
    
  },
// 页面加载
  onLoad:function(options){
    wx.setNavigationBarTitle({
      title: '故障维修'
    })
    
  },
// 勾选故障类型，获取类型值存入checkboxValue
  checkboxChange: function(e){
    let _values = e.detail.value;
    if(_values.length == 0){
      this.setData({
        btnBgc: ""
      })
    }else{
      this.setData({
        checkboxValue: _values,
        btnBgc: "#b9dd08"
      })
    }   
  },
// 输入单车编号，存入inputValue
  numberChange: function(e){
    this.setData({
      inputValue: {
        num: e.detail.value,
        desc: this.data.inputValue.desc
      }
    })
  },
// 输入备注，存入inputValue
  descChange: function(e){
    this.setData({
      inputValue: {
        num: this.data.inputValue.num,
        desc: e.detail.value
      }
    })
  },
// 提交到服务器
  formSubmit: function(e){
    if(this.data.picUrls.length > 0 && this.data.checkboxValue.length> 0){
      wx.request({
        url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/msg',
        data: {
          // picUrls: this.data.picUrls,
          // inputValue: this.data.inputValue,
          // checkboxValue: this.data.checkboxValue
        },
        method: 'get', // POST
        // header: {}, // 设置请求的 header
        success: function(res){
          wx.showToast({
            title: res.data.data.msg,
            icon: 'success',
            duration: 2000
          })
        }
      })
    }else{
      wx.showModal({
        title: "请填写反馈信息",
        content: '看什么看，赶快填反馈信息，削你啊',
        confirmText: "我我我填",
        cancelText: "劳资不填",
        success: (res) => {
          if(res.confirm){
            // 继续填
          }else{
            console.log("back")
            wx.navigateBack({
              delta: 1 // 回退前 delta(默认为1) 页面
            })
          }
        }
      })
    }    
  },
// 选择故障车周围环境图 拍照或选择相册
  bindCamera: function(){
    wx.chooseImage({
      count: 1, 
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'], 
      success: (res) => {
        console.log(res);
        var temp = res.tempFilePaths;
          
        let tfps = res.tempFilePaths;
        let _picUrls = this.data.picUrls;
        for(let item of tfps){
          _picUrls.push(item);
          this.setData({
            faultimage: tfps,
            photoFilePath: temp[0]
          });
        };
      }
    })
  },
// 删除选择的故障车周围环境图
  delPic: function(e){
    let index = e.target.dataset.index;
    let _picUrls = this.data.picUrls;
    _picUrls.splice(index,1);
    var temp = e.tempFilePaths.tempFilePaths;
    this.setData({
      picUrls: _picUrls,
      photoFilePath: temp[0]
    })
  },
  click1bindtap:function(e){
    if(this.data.click1){
      var index = this.data.faultreason.indexOf(1);
      this.data.faultreason.splice(index,1);
      var len = this.data.faultreason.length;
      this.setData({
        click1: false,
        commitdis: this.data.faultnum.length > 0 && (this.data.click2 || this.data.click3 || this.data.click4 || this.data.click5) ? false : true
      })
    }else{
      this.data.faultreason.push(1);
      this.setData({
        click1: true,
        commitdis: this.data.faultnum.length > 0 ? false : true
      })
    }
    
  },
  click2bindtap:function(e){
    if (this.data.click2) {
      var index = this.data.faultreason.indexOf(2);
      this.data.faultreason.splice(index,1);
      var len = this.data.faultreason.length;
      this.setData({
        click2: false,
        commitdis: this.data.faultnum.length > 0 && (this.data.click1 || this.data.click3 || this.data.click4 || this.data.click5) ? false : true
      })
    } else {
      this.data.faultreason.push(2);
      this.setData({
        click2: true,
        commitdis: this.data.faultnum.length > 0 ? false : true
      })
    }
  },
  click3bindtap:function(e){
    if (this.data.click3) {
      var index = this.data.faultreason.indexOf(3);
      this.data.faultreason.splice(index,1);
      var len = this.data.faultreason.length;
      this.setData({
        click3: false,
        commitdis: this.data.faultnum.length > 0 && (this.data.click2 || this.data.click3 || this.data.click4 || this.data.click5) ? false : true
      })
    } else {
      this.data.faultreason.push(3);
      this.setData({
        click3: true,
        commitdis: this.data.faultnum.length > 0 ? false : true
      })
    }
  },
  click4bindtap:function(e){
    if (this.data.click4) {
      var index = this.data.faultreason.indexOf(4);
      this.data.faultreason.splice(index,1);
      var len = this.data.faultreason.length;
      this.setData({
        click4: false,
        commitdis: this.data.faultnum.length > 0 && (this.data.click2 || this.data.click3 || this.data.click1 || this.data.click5) ? false : true
      })
    } else {
      this.data.faultreason.push(4);

      this.setData({
        click4: true,
        commitdis: this.data.faultnum.length > 0 ? false : true
      })
    }
  },
  click5bindtap:function(e){
    if (this.data.click5) {
      var index = this.data.faultreason.indexOf(5);
      this.data.faultreason.splice(index,1);
      var len = this.data.faultreason.length;
      this.setData({
        click5: false,
        commitdis: this.data.faultnum.length > 0 && (this.data.click2 || this.data.click3 || this.data.click4 || this.data.click1) ? false : true
      })
    } else {
      this.data.faultreason.push(5);
      this.setData({
        click5: true,
        commitdis: this.data.faultnum.length > 0 ? false : true
      })
    }
  },
  fault_num:function(e){
    var id = e.currentTarget.id;
    var item = this.data.numlist[id-1];
    if(item.check){            //取消点击 判断是否有故障选中和其他仓口选中
      item.check = false;
     this.numlis = this.data.numlist;
      this.setData({
        numlist: this.numlis      //设置numlist的值，刷新UI界面
      })
      var index = this.data.faultnum.indexOf(id);
      this.data.faultnum.splice(index,1);
      var nn = this.data.faultnum;
      var jj = this.data.faultnum.length > 0;
      if ((this.data.click1 || this.data.click2 || this.data.click3 || this.data.click4 || this.data.click5)&&this.data.faultnum.length>0){
      }else{
        this.setData({
          commitdis:true
        })
      }
    }else{                     //选中 判断是否有故障选中
      item.check = true;
      this.numlis = this.data.numlist;
      this.setData({
        numlist: this.numlis
      })
      this.data.faultnum.push(id);
      if ((this.data.click1 || this.data.click2 || this.data.click3 || this.data.click4 || this.data.click5)&&this.data.commitdis){
        this.setData({
          commitdis:false
        })
      }
    }
  },
  //处理描述内容，当失去焦点时触发，并获取描述值
  bindblur:function(e){
      this.data.describe = e.detail.value;
  },
  //处理输入字符的长度显示,键盘输入时触发该函数
  bindinput:function(e){
    var len = e.detail.value.length;
    this.setData({
      inputcount:len
    })
  },
  //点击提交按钮，上传图片和参数
  commit:function(e){
    var that = this;
    that.setData({
      commitdis:true
    })
    var faultReason = this.data.faultreason;
    var faultNum = this.data.faultnum;
    var faultReasonStr = "";
    var faultNumStr = "";
    //获取选取的故障类型，并封装成用,号拼接的字符串
    for (var i = 0; i < faultReason.length;i++){
      faultReasonStr = faultReasonStr + faultReason[i]+",";
    }
    //获取故障仓口，并封装成用,号拼接的字符串
    for (var i=0; i<faultNum.length; i++) {
      faultNumStr = faultNumStr+faultNum[i]+",";
    }

    console.log("faultReasonStr::::"+faultReasonStr);
    console.log("faultNumStr::::"+faultNumStr);
    if (this.data.chargingboxno == ''){  //没有扫码获取充电箱号时提醒用户，并取消本次提交
      wx.showModal({
        title: '请扫码获取充电箱编号',
        content: '',
      })
      that.setData({
        commitdis: false,
      })
      return;
    }
    wx.showLoading({
      title: '',
      mask:true,
    })
    wx.getStorage({
      key:app.constants.userinfo ,
      success: function(res) {
        var userinfo = JSON.parse(res.data);
        if (that.data.photoFilePath != '') {//有图片时访问的接口
          wx: wx.uploadFile({
            url: app.constants.ip +'/wechat/user/firstPage/devicefixImg',
            filePath: that.data.photoFilePath,
            name: 'file',
            header: {
              "Content-Type": "multipart/form-data"
            },
            formData: {
              skey:userinfo.skey,
              reasons: faultReasonStr,
              windowno: faultNumStr,
              remark: that.data.describe,
              chargingboxno: that.data.chargingboxno,
            },
            success: function (res) {
              console.log(res);
              var result = JSON.parse(res.data);
              var code = result.code; //获取返回值，判断上传数据是否成功
              if(code == "1"){
                wx.showModal({
                  title: '提交成功',
                  content: ''
                })
                that.clearData();
              }else{
                wx.showModal({
                  title: '',
                  content: '提交失败',
                })
              }
             
            },
            fail: function (res) {
              console.log("上传失败");
            },
            complete: function (res) {
              wx.hideLoading();
              that.setData({
                commitdis: false,
              })
            },
          })
        } else {   //没有图片时提交接口
          wx: wx.request({
            url: app.constants.ip +'/wechat/user/firstPage/devicefix',
            data: {
              skey: userinfo.skey,
              reasons: faultReasonStr,
              windowno: faultNumStr,
              remark: that.data.describe,
              chargingboxno: that.data.chargingboxno,
            },
            header: {},
            method: 'POST',
            dataType: 'json',
            responseType: 'text',
            success: function (res) {
              var code = res.data.code;
              if (code == "1") {
                wx.showModal({
                  title: '提交成功',
                  content: ''
                })
                that.clearData();
              } else {
                wx.showModal({
                  title: '',
                  content: '提交失败',
                })
              }
            },
            fail: function (res) {
              console.log("提交失败");
            },
            complete: function (res) { 
              wx.hideLoading() ;
              that.setData({
                commitdis: false,
              })
            },
          })
        }
      },
    })

  },
  contactservice:function(e){
    wx.makePhoneCall({
      phoneNumber: app.constants.serverPhoneNo,
    })
  },
  qr:function(e){
    var that = this;
    wx.scanCode({
      success: (res) => {
        // 正在获取密码通知
        var deviceNo = utils.getQueryString(res.result, 'sn');
        if(deviceNo != null){
          that.setData({
            chargingboxno: deviceNo,
            scan_type: true,
          })  
        }else{
          wx.showModal({
            title: '非法的二维码',
            content: '',
          })
        }
        // this.data.chargingboxno=res.result;
        console.log(res);
      }
    })
  },
  clearData:function(e){
    this.setData({
      numlist: [
        {
          num: 1,
          check: false
        },
        {
          num: 2,
          check: false
        },
        {
          num: 3,
          check: false
        },
        {
          num: 4,
          check: false
        },
        {
          num: 5,
          check: false
        },
        {
          num: 6,
          check: false
        },
        {
          num: 7,
          check: false
        },
        {
          num: 8,
          check: false
        },
        {
          num: 9,
          check: false
        },
        {
          num: 10,
          check: false
        }
      ],
      //设备故障类型
      faultnum: [],
      inputcount: 19,
      commitdis: true,
      describe: "",
      photoFilePath: "",
      click1: false,
      click2: false,
      click3: false,
      click4: false,
      click5: false,
      textValue:"",
      faultimage: "/images/add_photo.png",
      chargingboxno: "",
      scan_type: false,
    }) 
  }
})