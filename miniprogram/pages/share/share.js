// pages/share/share.js
import Notify from '../../dist/notify/notify';
const app = getApp()
const imgPath = "../../images/card-2.png";
const greenTagPath = "../../images/low.png";
const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const sentenceList={
  low: ["戴口罩，勤洗手，科学防守。", "不聚会，不传谣，理性防范。","注意个人防护，养成良好卫生习惯。"],
  medium: ["不外出、不聚集、不吃野味，规避风险。","疫情期间,请尽量减少外出活动。"],
  high: ["每天记得量体温，出现身体不适，一定要及时上报。","戴口罩、勤洗手、发热就诊。"]
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:{},//其他页面传递过来的信息
    openid:'',
    isToday:false,
    img_num:0,//从其他页面发送过来的日期%7，用于控制图片
    createTime:0,
    userInfo: {},//用户头像+用户昵称
    src: '',
    today:{},//当前时间
    continueDays:0,//打卡
    text:"",//显示文本
    regionalIndex:0,//易感指数
    tempFileURL:'',
    imgURL:app.globalData.imgURL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that =this;
    let regionalIndex = 0;
    this.widget = this.selectComponent('.widget');
    let openid = wx.getStorageSync('openid');
    let userInfo = wx.getStorageSync('userInfo');
    let img_num = parseInt(options.date)%7;
    let isToday = (options.isToday==0?false:true);//传过来的参数，用于判断是否是当天的卡片
    let createTime = options.createTime;//传过来的参数，用于获取创建卡片的时间
    this.setData({
      options:options,
      openid: openid,
      userInfo: userInfo,
      isToday:isToday,
      createTime: createTime,
      img_num:img_num
    })
    const db = wx.cloud.database();
    const _ = db.command;
    const report = db.collection('report');
    report.where({
      _openid:openid,
      createTime_num:_.lte(parseInt(createTime))
    }).count({
      success(res){
        that.setData({
          continueDays: res.total
        })
      },
      fail(res){
        console.log(res)
      }
    })
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: 'cloud://position-release-t8oyl.706f-position-release-t8oyl-1301301645/index-imgs/'+img_num+'.jpg',
        // fileID: 'cloud://position-9cjeb.706f-position-9cjeb-1301301645/index-imgs/'+img_num+'.jpg',
        maxAge: 60 * 60, // one hour
      }],
      success: res => {
        that.setData({
          tempFileURL:res.fileList[0].tempFileURL
        })
      },
      fail: err => {
        console.log(err)
      }
    })
    if (!isToday){
      report.where({
        _openid: openid,
        createTime: createTime
      }).get({
        success(res) {
          // console.log(res)
          let data = res.data;
          if (data.length == 0) {
            //没找到，报错，返回主页
            Notify({
              message: '未找到打卡记录',
              color: '#ffffff',
              background: '#c02c38'
            });
            wx.reLaunch({
              url: '../index/index',
            })
          } else {
            //找到
            let time = that.str2time(createTime);
            regionalIndex = data[0].regionalIndex;
            
            that.setData({
              today: {
                date:time.date,
                str_dot: time.day_str,
                time_num: time.time_str
              },
              regionalIndex: regionalIndex
            });
            if (regionalIndex <= 60) {
              let index = time.date % 3;
              that.setData({
                text: sentenceList.low[index]
              })
            } else if (regionalIndex > 60 && regionalIndex <= 80) {
              let index = time.date % 2;
              that.setData({
                text: sentenceList.medium[index]
              })
            } else {
              let index = time.date % 2;
              that.setData({
                text: sentenceList.high[index]
              })
            }
          }
        }
      })
    }else{
      let finalRes = wx.getStorageSync('finalRes');
      let today = this.getToday();
      regionalIndex = finalRes.regionalIndex;
      that.setData({
        today: today,
        regionalIndex: regionalIndex
      })
      if (regionalIndex <= 60) {
        let index = today.date % 3;
        that.setData({
          text: sentenceList.low[index]
        })
      } else if (regionalIndex > 60 && regionalIndex <= 80) {
        let index = today.date % 2;
        that.setData({
          text: sentenceList.medium[index]
        })
      } else {
        let index = today.date % 2;
        that.setData({
          text: sentenceList.high[index]
        })
      }
      
    }   
    
  },
  async renderToCanvas() {
    let that = this;
    let userInfo = this.data.userInfo;
    let options = this.data.options;
    // console.log(userInfo)
    
    userInfo = await that.getUserInfo(userInfo);
    
    let img_num = that.data.img_num;
    let tempFileURL = that.data.tempFileURL;
    that.widget = that.selectComponent('.widget');
    
    let today = that.data.today;
    let continueDays = that.data.continueDays;
    let text = that.data.text;
    let regionalIndex = that.data.regionalIndex;
    let img = 'low';
    let color = 'green';
    if (regionalIndex<=60){
      img = 'low';
      color = 'green';
    } else if (regionalIndex > 60 && regionalIndex<=80){
      img = 'medium';
      color = 'orange';
    }else{
      img='high';
      color = 'red';
    }
    that.setData({
      today:today
    })
    // <image class="backImg" src="cloud://position-9cjeb.706f-position-9cjeb-1301301645/index-imgs/`+img_num+`.jpg"></image>
    // <image class="backImg" src="../../images/share-imgs/1.jpg"></image>
    const wxml = `
<view class="container">
<image class="backImg" src="`+tempFileURL+`"></image>
  <view class="userInfo">
  <image class="avatar" src="`+ userInfo.avatarUrl+`"></image>
  <text class="nickName">`+ userInfo.nickName+`</text>
  </view>
  <view class="timeInfo">
  <image class="timeImg" src="../../images/canvas-imgs/time.png"></image>
  <text class="timeL">`+today.time_num+`</text>
  <text class="timeR">打卡第`+continueDays+`天</text>
  </view>
  <view class="whiteBack">
  <text class="title">易感指数</text>
  <text class="num `+ color + `">` + regionalIndex+`</text> 
  <image class="tag" src="../../images/canvas-imgs/`+img+`.png"></image>
  <text class="otherText">`+text+`</text>
  <text class="time">`+ today.str_dot +`</text>
  <image class="ewmImg" src="../../images/canvas-imgs/ewm.png"></image>
  </view>
</view>
`

    const style = {
      container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 375,
        height: 560,
        backgroundColor: '#d8e3e7',
      },
      backImg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 375,
        height: 315
      },
      userInfo: {
        width: 280,
        height: 120,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
      },
      avatar: {
        width: 80,
        height: 80,
        position: "absolute",
        top: 10,
        left: 105,
        borderRadius: 40
      },
      nickName: {
        width: 120,
        height: 30,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 100
      },
      timeInfo: {
        width: 280,
        height: 20
      },
      timeImg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 20,
        height: 20
      },
      timeL: {
        position: 'absolute',
        top: 1,
        left: 22,
        width: 50,
        height: 20,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
      },
      timeR: {
        position: 'absolute',
        top: 1,
        right: 5,
        width: 100,
        height: 20,
        fontSize: 14,
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#fff',
      },
      whiteBack: {
        width: 300,
        height: 350,
        flexDirection: 'column',

        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 25
      },
      title: {
        width: 100,
        height: 35,
        textAlign: 'center',
        verticalAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#576b95',
        marginTop: 25
      },
      num: {
        width: 80,
        height: 58,
        textAlign: 'center',
        verticalAlign: 'center',
        fontSize: 40,
        fontWeight: 'bold'
      },
      green: {
        color: "#61ac85"
      },

      orange: {
        color: "#fba414"
      },

      red: {
        color: "#c02c38"
      },
      tag: {
        position: 'absolute',
        top: 110,
        left: 137,
        width: 30,
        height: 20
      },
      otherText: {
        width: 280,
        height: 300,
        textAlign: 'center',
        verticalAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#576b95',
        marginTop: 25
      },
      ewmImg: {
        position: 'absolute',
        bottom: 40,
        left: 100,
        width: 100,
        height: 100
      },
      time: {
        position: 'absolute',
        bottom: 0,
        left: 100,
        width: 100,
        height: 30,
        textAlign: 'center',
        fontSize: 15,
        color: '#576b95'
      }
    }
    //先生成canvas
    const p1 = that.widget.renderToCanvas({
      wxml,
      style
    })
    p1.then((res) => {
      // console.log('container', res.layoutBox)
      this.container = res;
      //将canvas转为jpg
      const p2 = that.widget.canvasToTempFilePath()
      p2.then(res => {
        that.setData({
          src: res.tempFilePath
        });
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            console.log(res);
            Notify({
              message: '图片保存成功',
              color: '#ffffff',
              background: '#576b95'
            });
          },
          fail(res) {
            console.log(res);
            Notify({
              message: '图片保存失败',
              color: '#ffffff',
              background: '#c02c38'
            });
          }
        })
      })
    });
  },
  toHome(){
    wx.reLaunch({
      url: '../index/index',
    })
  },
  //毫秒字符串转时间
  str2time(str) {
    let sec = parseInt(str);
    let day = new Date(sec);
    let year = day.getFullYear();
    let month = day.getMonth() + 1;
    let date = day.getDate();
    let weekday = day.getDay();
    let hour = day.getHours();
    let min = day.getMinutes();
    let time_str = this.overTen(hour)+':'+this.overTen(min);
    let day_str = this.overTen(year) + '.' + this.overTen(month) + '.' + this.overTen(date);
    // console.log({
    //   sec: sec,
    //   weekday_num: weekday,
    //   day_str: day_str,
    //   time_str: time_str,
    //   weekday: weekList[weekday]
    // })
    return {
      sec: sec,//毫秒
      date:date,//日期
      weekday_num: weekday,//星期，数字
      day_str: day_str,//日期‘2020.02.20’
      time_str:time_str,//时间‘20:20’
      weekday: weekList[weekday]//“星期三”
    }
  },
  getToday() {
    let today = new Date();
    let year = today.getFullYear();//年
    let month = today.getMonth() + 1;//月
    let date = today.getDate();//日
    let hour = today.getHours();//时
    let miniute = today.getMinutes();//分
    let str_num = this.overTen(year) + '-' + this.overTen(month) + '-' + this.overTen(date);
    let str_dot = this.overTen(year) + '.' + this.overTen(month) + '.' + this.overTen(date);
    let str_ch = this.overTen(year) + '年' + this.overTen(month) + '月' + this.overTen(date) + '日';
    let time_num = this.overTen(hour)+':'+this.overTen(miniute);
    return {
      year: year,
      month: month,
      date: date,
      hour: hour,
      miniute:miniute,
      str_dot:str_dot,
      str_num: str_num,
      str_ch: str_ch,
      time_num:time_num
    }
  },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return num;
    }
  },
  getUserInfo(userInfo){
    return new Promise(function(resolve,reject){
      wx.getSetting({
        complete: (res) => {
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success(res) {
                // console.log(res);
                let info = {
                  avatarUrl: res.userInfo.avatarUrl,
                  nickName: res.userInfo.nickName,
                  gender: res.userInfo.gender
                };
                resolve(info)
                wx.setStorageSync('userInfo', info);
                Notify({
                  message: '正在保存图片...',
                  color: '#ffffff',
                  background: '#576b95',
                  duration:4000
                });
                // setTimeout({},"2000");
                // wx.reLaunch({
                //   url: '../share/share?createTime=' + options.createTime + '&date='+options.date+ '&isToday='+options.isToday,
                // })
              },
              fail(res){
                Notify({
                  message: '已拒绝获取信息，无法保存图片',
                  color: '#ffffff',
                  background: '#c02c38'
                });
              }
            });
          }
        },
      })
        
    })
  },
  //之前写的手动生成canvas
  onSave(e) {

    let userInfo = this.data.userInfo;
    //获取用户头像、用户名
    const ctx = wx.createCanvasContext('shareCanvas');
    //背景图片
    ctx.drawImage(imgPath, 0, 0, 300, 533);
    ctx.drawImage(greenTagPath, 138, 230, 30, 20);
    ctx.drawImage(userInfo.avatarUrl, 0, 0, 50, 50);
    //文字：文案
    ctx.font = "normal bold 13px sans-serif";
    ctx.setTextAlign('center');
    ctx.setFillStyle('#fff');
    ctx.fillText(userInfo.nickName, 150, 100);

    ctx.font = "normal bold 13px sans-serif";
    ctx.setFillStyle('#fff');
    ctx.fillText("10:20", 88, 125);

    ctx.font = "normal bold 13px sans-serif";
    ctx.setFillStyle('#fff');
    ctx.fillText("打卡第33天", 200, 125);

    ctx.font = "normal bold 20px sans-serif";
    ctx.setTextAlign('center');
    ctx.setFillStyle('#576b95');
    ctx.fillText("易感指数", 150, 170);

    ctx.font = "normal bold 40px sans-serif";
    ctx.setTextAlign('center');
    ctx.setFillStyle('#61ac85');
    ctx.fillText("15", 150, 220);

    ctx.font = "normal bold 14px sans-serif";
    ctx.setTextAlign('center');
    ctx.setFillStyle('#576b95');
    ctx.setFontSize(14);
    ctx.fillText("戴口罩，勤洗手，科学防守", 150, 305);

    ctx.font = "normal bold 13px sans-serif";
    ctx.setTextAlign('center');
    ctx.setFillStyle('#576b95');
    ctx.setFontSize(13);
    ctx.fillText("2020.02.20", 150, 470);
    ctx.stroke();
    ctx.draw();

  },

  // canvasIdErrorCallback: function (e) {
  //   console.error(e.detail.errMsg)
  // },
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
  onShareAppMessage: function(res) {
    const textList = ['您的朋友喊你来“疫卡通”打卡~','快来“疫卡通”打卡吧！'];
    let index = new Date().getTime()%2;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: textList[index],
      path: '/pages/index/index'
    }
  }
})