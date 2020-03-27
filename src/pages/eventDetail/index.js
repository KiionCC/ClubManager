// pages/eventDetail/index.js
var app = getApp()
wx.cloud.init()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventData: {},
    eventState: 0, 
    //活动状态：
    //0为报名未截止 活动未结算，
    //1为报名截止 活动未结算，
    //2为报名截止 活动结算

    myEnrollData: {},
    isManager: false,
    couldSigned: false,
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    wx.setNavigationBarTitle({
      title: app.globalData.currentEvent.name //页面标题为社团名
    })

    //初始化活动数据
    that.setData({
      eventData: app.globalData.currentEvent
    })
    //比对社团信息
    if (app.globalData.currentEvent.club_id == app.globalData.currentClub._id) {
      that.setData({
        show: true
      })
    }
    //console.log(that.data)

    var _signEndTime = new Date(that.data.eventData.signEndTime)
    var _beginTime = new Date(that.data.eventData.beginTime)
    var timestamp = Date.parse(_beginTime)
    timestamp = timestamp - 30 * 60 * 1000
    var beginSignTime = new Date(timestamp)
    //报名截止 活动未结束，关闭报名，eventState设为1
    if (_signEndTime < new Date() && !that.data.eventData.isOver) {
      that.setData({
        eventState: 1
      })
    }   
    //报名截止 活动结算，关闭报名和签到，活动发起者打开结算按钮，eventState设为2
    if (_beginTime < new Date()) {
      that.setData({
        eventState: 2
      })
    }
    //活动进行状态
    console.log(that.data.eventState)

    //获取社团头像
    db.collection('club').doc(that.data.eventData.club_id).get({
      success(res) {
        that.setData({
          'eventData.icon_id': res.data.icon_id
        })
      }
    })
    //获取是否是管理员身份
    db.collection('club_member').where({
      club_id: that.data.eventData.club_id,
      student_id: app.globalData.stuNum,
    }).get({
      success(res) {
        if (res.data[0].level == 1 || res.data[0].level == 2)
          that.setData({
            isManager: true
          })
      }
    })

    //获取我的报名信息
    db.collection('event_member').where({
      club_id: _.eq(that.data.eventData.club_id),
      student_id: _.eq(app.globalData.stuNum),
      event_id: _.eq(that.data.eventData._id)
    }).get({
      success(res) {
        //console.log(res.data)
        that.setData({
          myEnrollData: res.data
        })
        //判断能否签到
        if (beginSignTime <= new Date() && _beginTime > new Date() && that.data.myEnrollData.length != 0 && that.data.myEnrollData[0].isSign == false) {
          that.setData({
            couldSigned: true
          })
        }
        else {
          that.setData({
            couldSigned: false
          })
        }
        //开始签到时间和活动开始时间
        //console.log(beginSignTime)
        //console.log(_beginTime)
        //我的报名数据
        //console.log(that.data.myEnrollData)
        //是否签到
        console.log(that.data.myEnrollData[0].isSign)
        //是否能够签到
        console.log(that.data.couldSigned)
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  //活动报名
  enroll: function() {
    var that = this

    wx.showLoading({
      title: '提交中',
    })
    wx.cloud.callFunction({
      name: "enrollEvent",
      data: {
        club_id: app.globalData.currentClub._id,
        event_id: that.data.eventData._id,
        student_id: app.globalData.stuNum,
      },
      success(res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '报名成功',
          icon: 'success',
          duration: 1000
        })

        //获取我的报名信息 判断能否签到
        db.collection('event_member').where({
          club_id: _.eq(that.data.eventData.club_id),
          student_id: _.eq(app.globalData.stuNum),
          event_id: _.eq(that.data.eventData._id)
        }).get({
          success(res) {
            //console.log(res.data)
            that.setData({
              myEnrollData: res.data
            })

            var _signEndTime = new Date(that.data.eventData.signEndTime)
            var _beginTime = new Date(that.data.eventData.beginTime)
            var timestamp = Date.parse(_beginTime)
            timestamp = timestamp - 30 * 60 * 1000
            var beginSignTime = new Date(timestamp)
            //判断能否签到
            if (beginSignTime <= new Date() && _beginTime > new Date() && that.data.myEnrollData.length != 0 && that.data.myEnrollData[0].isSign == false) {
              that.setData({
                couldSigned: true
              })
            }
            else {
              that.setData({
                couldSigned: false
              })
            }
            //是否签到
            console.log(that.data.myEnrollData[0].isSign)
            //是否能够签到
            console.log(that.data.couldSigned)
          }
        })

      }
    })
  },

  //活动签到
  sign: function() {
    var that = this
    wx.showLoading({
      title: '签到中',
    })
    wx.cloud.callFunction({
      name: "signEvent",
      data: {
        club_id: app.globalData.currentClub._id,
        event_id: that.data.eventData._id,
        student_id: app.globalData.stuNum,
      },
      success(res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '签到成功',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          'couldSigned': false
        })
      }
    })
  },

  //获取报名信息
  /*  getMyEnroll: function () {
    var that = this

    db.collection('event_member').where({
      club_id: _.eq(that.data.eventData.club_id),
      student_id: _.eq(app.globalData.stuNum),
      event_id: _.eq(that.data.eventData._id)
    }).get({
      success(res) {
        //console.log(res.data)
        that.setData({
          myEnrollData: res.data
        })
        console.log(that.data.myEnrollData)
      }
    })
  },   */
  

  //活动结算
  finish: function() {
    var that = this
    wx.showLoading({
      title: '活动结算中',
    })
    wx.cloud.callFunction({
      name: "finishEvent",
      data: {
        event_id: that.data.eventData._id,
        level: that.data.eventData.level,
      },
      success(res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '活动结算成功',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          'eventData.isOver': true
        })
      },
      fail: console.error
    })
  }
})