//index.js
// const cardList = require('../../example.js');
const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
import Notify from '../../dist/notify/notify';
import Toast from '../../dist/toast/toast';
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;
const user_1 = db.collection('user-1');
const report = db.collection('report');
Page({
  data: {
    today:{},
    isBind: true, //用户是否绑定手机号
    isPushed: false, //今日是否打卡
    cardList: [],
    openid: '',
    name: '', //用户姓名
    idNum: '', //用户学号
    phoneNum: '', //用户手机号
    // phone_hide:'',
    classA: '',
    classB: '',
    classC: '',
    total_self:0,//总共打卡次数
    total_all:0,//当天所有人打卡次数
    imgURL:app.globalData.imgURL
  },

  onLoad: function() {
    let that = this;
    let openid = wx.getStorageSync('openid');
    if(openid==''){
      //获取openid
      wx.cloud.callFunction({
        name: 'getContext',
        success(res) {
          // console.log(res)
          wx.setStorageSync('openid', res.result.openid);
          
          wx.reLaunch({
            url: '../index/index',
          })
        }
      });
    }
    let today = wx.getStorageSync('today');
    let isNew = wx.getStorageSync('isNew');//判断是否是新的一天

    let start = this.getTodaySec();
    this.setData({
      openid: openid,
      today:today
    })  
    
    //查询是否绑定了手机号
    user_1.where({
      _openid: openid
    }).get({
      success(res) {
        //用户未绑定
        if (res.data.length == 0) {
          that.setData({
            isBind: false
          });
          wx.setStorageSync('isBind', false);
          wx.setStorageSync('user', {
            classA: '',
            classB: '',
            classC: '',
            name: '',
            idNum: '',
            phoneNum: '',
            classA:'',
            isPushed: false,
            pushTimes: 0
          });
          // if(isNew){
          //   wx.navigateTo({
          //     url: '../welcome/welcome',
          //   })
          // }
          
        } else {
          let name = res.data[0].name;
          let idNum = res.data[0].number;
          let phoneNum = res.data[0].phone;
          // let phone_hide = phoneNum.substring(0,3)+'****'+phoneNum.substring(11-4);
          // console.log(phone_hide)
          let pushTimes = res.data[0].pushTimes;
          let isPushed = res.data[0].isPushed;
          let classA = res.data[0].classA;
          let classB = res.data[0].classB;
          let classC = res.data[0].classC;
          
          //用户已绑定
          that.setData({
            isBind: true,
            classA: classA,
            classB: classB,
            classC: classC,
            name: name,
            idNum: idNum,
            phoneNum: phoneNum,
            // phone_hide:phone_hide,
            pushTimes: pushTimes,
            isPushed: isPushed
          })
          wx.setStorageSync('isBind', true);
          wx.setStorageSync('user', {
            classA: classA,
            classB: classB,
            classC: classC,
            name: name,
            idNum: idNum,
            phoneNum: phoneNum,
            pushTimes: pushTimes,
            isPushed: isPushed
          });
        }
        // console.log(res)
      },
      fail(res){
        console.log(res)
      }
    })
    wx.cloud.callFunction({
      name: 'getMonthCard',
      data:{
        year:today.year
      },
      success(res) {
        // console.log(res)
        wx.setStorageSync('detail', res.result)
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  
  onTest(){
    let toast_num = wx.getStorageSync('toast_num');
    // console.log(toast_num);
    if(toast_num<6){
      let openid = wx.getStorageSync('openid');
      wx.requestSubscribeMessage({
        tmplIds: ['pw3_2EzrLjX5ezhxQaRYVYolzscsCMJ5SdGyQ4Ie5Ho'],
        success(res) {
          // console.log(res);
          let mes = res.pw3_2EzrLjX5ezhxQaRYVYolzscsCMJ5SdGyQ4Ie5Ho;
          if (mes == 'accept') {
            //允许
            user_1.where({
              _openid: openid
            }).update({
              data: {
                pushTimes: _.inc(1)
              },
              success(res){
                toast_num+=1;
                if(toast_num==1){
                  Toast('明天我提醒你打卡~');
                }else if(toast_num==2){
                  Toast('明天也要继续加油呀~');
                }else if(toast_num==3){
                  Toast('不聚会，不传谣，理性防范。');
                }else if(toast_num==4){
                  Toast('注意个人防护，养成良好卫生习惯！');
                }else if(toast_num==5){
                  Toast('戴口罩，勤洗手，科学防守。');
                }
                wx.setStorageSync('toast_num', toast_num);
              }
            })
          } else {
            //拒绝
            user_1.where({
              _openid: openid
            }).update({
              data: {
                pushTimes: 0
              }
            })
          }
        },
        fail(res) {
          console.log(res);
        }
      })
    }else{
      Toast('一天最多点击5次喔~');
    }
  },
  toSetting() {
    wx.navigateTo({
      url: '../check/check',
    })
  },
  toCalendar() {
    wx.navigateTo({
      url: '../calendar/calendar',
    })
  },
  toForm(e) {
    // console.log(e)
    let item = e.currentTarget.dataset.item;
    // if(item.ifChange>1){
      if (item.isPushed) {
        wx.navigateTo({
          url: '../share/share?createTime=' + item.createTime + '&date='+item.date_num+'&isToday=0',
        })
      } else {
        wx.navigateTo({
          url: '../form/form',
        })
      }
    // }else{
    //   if (!item.isPushed){
    //     Notify({
    //       message: "打卡时间段为7:00-22:00",
    //       color: '#ffffff',
    //       background: '#576b95'
    //     });        
    //   }
    // }
  },
  onShow() {
    let that = this;
    let openid = this.data.openid;
    // let openid = wx.getStorageSync('openid');
    // console.log(openid)
    if(openid==''){
      //获取openid
      wx.cloud.callFunction({
        name: 'getContext',
        success(res) {
          // console.log(res)
          wx.setStorageSync('openid', res.result.openid);
          that.setData({
            openid: openid
          })
          wx.reLaunch({
            url: '../index/index',
          })
        }
      });
    }
    // let openid = wx.getStorageSync('openid');
    let today = this.data.today;
    let start = this.getTodaySec();
    // let isNew = wx.getStorageSync('isNew');
    
    
    //今日打卡人数计算
    report.where({
      createTime_num: _.gte(start)
    }).count({
      success(res) {
        that.setData({
          total_all: res.total
        })
      }
    })
    //获取个人总共打卡次数
    report.where({
      _openid: openid
    }).count({
      success(res) {
        that.setData({
          total_self: res.total
        })
      }
    })
    //查询打卡
    report.aggregate().match({
      _openid: openid
    })
    .sort({
      createTime_num: -1,
    }).limit(7).end({
      success(res) {
        // console.log(res);
        let list = res.list;
        // if(isNew){
        //   wx.reLaunch({
        //     url: '../index/index',
        //   })
        // }
        if (list.length == 0) {
          //如果没有打卡数据
          let newList = new Array();
          
          newList.push({
            id: 1,
            createTime: 0,
            date: today.str_dot,
            date_num:today.date,
            weekday: today.weekday,
            weekday_num: today.weekday_num,
            isPushed: false
          });
          that.setData({
            isPushed: false,
            cardList: newList
          })
        } else {
          //如果有数据
          let isPushed = that.isPush(list);

          that.setData({
            isPushed: isPushed
          })
          let newList = new Array();
          list.forEach((item, index) => {
            let createTime = that.str2date(item.createTime_num);
            let temp = {
              id: list.length-index,
              createTime: item.createTime_num,
              date: createTime.day_str,
              date_num:createTime.date,
              weekday: createTime.weekday,
              weekday_num: createTime.weekday_num,
              isPushed: true,
              // ifChange: 2
            }
            newList.push(temp);
          })
          that.setData({
            cardList: newList
          })

          if (!isPushed) {
            //今日未打卡
            let len = newList.length;
            // if(len>6){
            //   newList.splice(6,1);
            // }
            // console.log(newList)
            let newList_today = newList.reverse();
            newList_today.push({
              id: len+1,
              createTime: 0,
              date: today.str_dot,
              date_num:today.date,
              weekday: today.weekday,
              weekday_num: today.weekday_num,
              isPushed: isPushed
            });
            
            that.setData({
              cardList: newList_today.reverse()
            })
            // console.log(that.data.cardList)
          }
        }
      },
      fail(res) {
        console.log('查询是否已打卡失败');
        // console.log(res);
        let newList = new Array();
        newList.push({
          id: 1,
          createTime: 0,
          date: today.str_dot,
          date_num:today.date,
          weekday: today.weekday,
          weekday_num: today.weekday_num,
          isPushed: false
        });
        that.setData({
          isPushed: false,
          cardList: newList.reverse()
        });
        Notify({
          message: '系统错误',
          color: '#ffffff',
          background: '#c02c38'
        });
      }
    })
  },
  //用于计算当天的毫秒数
  getTodaySec() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let date = today.getDate();
    let start = new Date(year, month, date).getTime();
    return start;
  },
  //判断当天是否打卡
  isPush(arr) {
    let last = arr[0];
    let lastTime = last.createTime_num;
    let start = this.getTodaySec();
    if (lastTime > start) {
      return true;
    } else {
      return false;
    }
  },
  //毫秒字符串转时间
  str2date(sec) {
    // let sec = parseInt(str);
    let day = new Date(sec);
    let year = day.getFullYear();
    let month = day.getMonth() + 1;
    let date = day.getDate();
    let weekday = day.getDay();
    let day_str = this.overTen(year) + '.' + this.overTen(month) + '.' + this.overTen(date);
    return {
      sec: sec,
      date:date,
      day_str: day_str,
      weekday_num:weekday,
      weekday: weekList[weekday]
    }
  },
  // //获取今天的数值
  // getToday() {
  //   let today = new Date();
  //   let year = today.getFullYear();
  //   let month = today.getMonth() + 1;
  //   let hour = today.getHours();
  //   let date = today.getDate();
  //   let weekday = today.getDay();
  //   let str_dot = this.overTen(year) + '.' + this.overTen(month) + '.' + this.overTen(date);
  //   let str_num = this.overTen(year) + '-' + this.overTen(month) + '-' + this.overTen(date);
  //   let str_ch = this.overTen(year) + '年' + this.overTen(month) + '月' + this.overTen(date) + '日';
  //   return {
  //     year: year,
  //     month: month,
  //     date: date,
  //     hour: hour,
  //     weekday:weekList[weekday],
  //     str_dot: str_dot,
  //     str_num: str_num,
  //     str_ch: str_ch
  //   }
  // },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return num;
    }
  },
  

})