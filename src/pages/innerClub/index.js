var sliderWidth = 45
var app = getApp()
wx.cloud.init()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["活动","投票","功能"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    level:0,

    //活动
    events: [],

    //投票
    votes:[],
    isVote: false,

    //功能
    memFunc: [
      { name: "查看成员", icon: "member", url: '../memberList/index' },
      { name: "成员统计", icon:"memberStatic", url: '../statistical/index' }
    ],
    adminFunc: [
      { name: "发起活动", icon: "releaseEvent", url: '../createEvent/index'}, 
      { name: "发起投票", icon: "releaseVote", url:'../createVoting/index' }, 
      { name: "处理申请", icon: "handleAppli",url:'../handleJoin/index' },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.setNavigationBarTitle({
      title: app.globalData.currentClub.name//页面标题为社团名
    })

    db.collection('club_member').where({
       club_id: app.globalData.currentClub._id, 
       student_id: app.globalData.stuNum})
       .get({
      success(res) {
        console.log(res.data[0].level)
        that.setData({
          level: res.data[0].level
        })
      },
      fail: console.error
    })
    
    // db.collection('club_member').doc(app.globalData.stuNum + app.globalData.currentClub._id).get({
    //   success(res){
    //     console.log(res.data.level)
    //     that.setData({
    //       level:res.data.level
    //     })
    //   },
    //   fail: console.error
    // })

    that.getEvent()
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
    var that = this;

    /*初始化TAB导航栏信息*/
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
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
    console.log(1)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  /*滑块*/
  tabClick: function (e) {
    var that = this;
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      isEmpty: true,
    });

    /*获取投票列表*/
    if (that.data.activeIndex == 1){
      that.setData({
        isVote: false
      })
      wx.showLoading({
        title: '加载中',
      })
      db.collection('vote').where({
        club_id: _.eq(app.globalData.currentClub._id)
      }).orderBy('deadline', 'desc').get({
        success(res){
          console.log("获取投票列表成功")
          that.setData({
            votes: res.data,
            isVote: res.data.length,
          })
          for(var i = 0; i < that.data.votes.length; i++){
            var deadline = 'votes[' + i + '].deadline'
            that.setData({
              [deadline]: that.data.votes[i].deadline.toLocaleDateString().replace(/\//g, "-") + " " + that.data.votes[i].deadline.toTimeString().substr(0, 8)
            })
          }
          wx.hideLoading()
        },
        fail: console.error
      })
    }
    else if (that.data.activeIndex == 0){
      that.getEvent()
    }
  },

  /*跳转到投票页面*/
  jumpToVote: function(e){
    var that = this

    /*获取点击投票*/
    var id = e.currentTarget.dataset.index;
    id = parseInt(id);
    app.globalData.currentVote = that.data.votes[id];
    
    wx.navigateTo({
      url: '../vote/index',
    })
  },

  /*获取活动列表*/
  getEvent: function(){
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    db.collection('event').where({
      club_id: _.eq(app.globalData.currentClub._id)
    }).orderBy('beginTime', 'desc').get({
      success(res){
        console.log(res.data)
        that.setData({
          events: res.data
        })
        for (var i = 0; i < that.data.events.length; i++) {
          var beginTime = 'events[' + i + '].beginTime'
          that.setData({
            [beginTime]: that.data.events[i].beginTime.toLocaleDateString().replace(/\//g, "-") + " " + that.data.events[i].beginTime.toTimeString().substr(0, 8)
          })
          //console.log(that.data.events[i].beginTime)
          if (that.data.events[i].signEndTime) {
            var signEndTime = 'events[' + i + '].signEndTime'
            that.setData({
              [signEndTime]: that.data.events[i].signEndTime.toLocaleDateString().replace(/\//g, "-") + " " + that.data.events[i].signEndTime.toTimeString().substr(0, 8)
            })
            //console.log(that.data.events[i].signEndTime)

          }
          
        }
        wx.hideLoading()
      }
    })
  },

  /*活动详情*/
  eventDetail: function(e){
    var that = this

    /*获取点击活动*/
    var id = e.currentTarget.dataset.index;
    id = parseInt(id);
    app.globalData.currentEvent = that.data.events[id];

    wx.navigateTo({
      url: '../eventDetail/index',
    })
  }
})