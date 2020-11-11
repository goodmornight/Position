// pages/calendar/calendar.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid:'',
    total_all:0,//总共打卡次数
    total_month:0,
    detail:[],//所有的打卡记录
    detail_month:[],
    origin_year:0,//原本的年
    year: 0,//当前的年
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,
    height:0,
    width:0,
    imgURL:app.globalData.imgURL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let today = wx.getStorageSync('today');
    let detail = wx.getStorageSync('detail');
    let height = wx.getSystemInfoSync().windowHeight;
    let width = wx.getSystemInfoSync().windowWidth;
    
    this.setData({
      height: height,
      width: width
    });
    const openid = wx.getStorageSync('openid');
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.setData({
      today:today,
      origin_year:year,
      year: year,
      month: month,
      isToday: '' + year + month + now.getDate(),
      openid: openid,
      detail:detail
    })
    // wx.cloud.callFunction({
    //   name: 'getMonthCard',
    //   data:{
    //     year:that.data.year
    //   },
    //   success(res) {
    //     console.log(res)
    //     that.setData({
    //       detail:res.result
    //     })
    //     that.dateInit();
    //   },
    //   fail(res) {
    //     console.log(res)
    //   }
    // })
    this.dateInit();
    

    const db = wx.cloud.database();
    const report = db.collection('report');
    report.where({
      _openid: openid
    }).count({
      success(res){
        that.setData({
          total_all:res.total
        })
      }
    })
  },
  dateInit: function (setYear, setMonth) {
    let that = this;
    let detail = this.data.detail;//所有打卡数据
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = [];                       //需要遍历的日历数组数据
    let arrLen = 0;                         //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();                 //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + '/' + (month + 1) + '/' + 1).getDay();//目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();//获取目标月有多少天
    let obj = {};
    let num = 0;
    let start = new Date(year, month, 1, 7, 0, 0).getTime(); //当月第一天7点
    let end = new Date(year, month, dayNums, 22, 0, 0).getTime(); //当月最后一天晚上22点
    
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;
    that.setData({
      total_month: detail[month].length
    })
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        let isCompleted = false;
        let createTime = 0;
        
        detail[month].forEach(item=>{
          if(num==item.date){
            isCompleted = true;
            createTime = item.createTime;
          }
        });
        // if(num==18||num==19||num==20){
        //   isCompleted = true;
        // }
        obj = {
          isToday: '' + year + (month + 1) + num,
          dateNum: num,
          isCompleted:isCompleted,
          createTime:createTime
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr
    })
    
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },
  /**
   * 上月切换
   */
  lastMonth: function () {
    let that = this;
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    let origin_year = this.data.origin_year;
    if(year!=origin_year){
      that.setData({
        origin_year:year,
        year: year,
        month: (month + 1)
      });
      wx.cloud.callFunction({
        name: 'getMonthCard',
        data: {
          year: that.data.year
        },
        success(res) {
          // console.log(res)
          that.setData({
            detail: res.result
          })
          that.dateInit(year, month);
        },
        fail(res) {
          console.log(res)
        }
      })
    }else{
      that.setData({
        year: year,
        month: (month + 1)
      })
      that.dateInit(year, month);
    }
    
  },
  /**
   * 下月切换
   */
  nextMonth: function () {
    let that = this;
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    let origin_year = this.data.origin_year;
    if (year != origin_year) {
      that.setData({
        origin_year: year,
        year: year,
        month: (month + 1)
      });
      wx.cloud.callFunction({
        name: 'getMonthCard',
        data: {
          year: that.data.year
        },
        success(res) {
          // console.log(res)
          that.setData({
            detail: res.result
          })
          that.dateInit(year, month);
        },
        fail(res) {
          console.log(res)
        }
      })
    } else {
      that.setData({
        year: year,
        month: (month + 1)
      })
      that.dateInit(year, month);
    }
    // this.setData({
    //   year: year,
    //   month: (month + 1)
    // })
    // this.dateInit(year, month);
  },
  toTheDay(res){
    let isToday = this.data.isToday;
    //选中的日期
    let year = res.currentTarget.dataset.year;
    let month = res.currentTarget.dataset.month;
    let day = res.currentTarget.dataset.datenum;
    let isCompleted = res.currentTarget.dataset.completed;
    let createTime = res.currentTarget.dataset.createtime;
    // console.log(res)
    if(isCompleted){
      wx.navigateTo({
        url: '../share/share?createTime=' + createTime+ '&date='+day+'&isToday=0'
      })
    }else if(isToday==(''+year+month+day)){
      wx.navigateTo({
        url: '../form/form',
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

  }
})