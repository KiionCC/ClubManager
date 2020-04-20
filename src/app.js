wx.cloud.init()
//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              this.globalData.isLogin = true
              console.log("成功登录")

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              //获取注册状态
              wx.cloud.callFunction({
                name: 'isRegistered',
                complete: res => {
                  //console.log(res)
                  this.globalData.isRegistered = res.result.length
                  if (this.globalData.isRegistered) {
                    this.globalData.stuNum = res.result[0].number //如果已注册，获取学号
                    this.globalData.name = res.result[0].name
                    console.log("已经注册")
                  }
                  else {
                    console.log("尚未注册")
                  }
                }
              })
            }
          })
        }
        else{
          console.log("尚未登录")
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    isLogin: false,
    isRegistered: false,
    stuNum: 0,
    name: "",
    currentClub: "",
    currentVote: {},
    province: ["北京市", "天津市", "上海市", "重庆市", "河北省", "山西省", "辽宁省", "吉林省", "黑龙江省", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省", "河南省", "湖北省", "湖南省", "广东省", "海南省", "四川省", "贵州省", "云南省", "陕西省", "甘肃省", "青海省", "台湾省", "内蒙古自治区", "广西壮族自治区", "西藏自治区", "宁夏回族自治区", "新疆维吾尔自治区", "香港特别行政区", "澳门特别行政区"],
    currentEvent: {}
  }
})