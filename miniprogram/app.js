//app.js
const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
import Toast from 'dist/toast/toast';
App({
  onLaunch:function () {
    let that = this;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'position-9cjeb',
        // env: 'position-release-t8oyl',
        // env:{
        //   database:"position-release-t8oyl",
        //   storage:"position-release-t8oyl",
        //   functions:"position-release-t8oyl"
        // },
        traceUser: true,
      })
    }
    
    //获取openid
    // let openid = await this.getOpenId();
    // wx.setStorageSync('detail', [[],[],[],[],[],[],[],[],[],[],[],[]]);
    wx.cloud.callFunction({
      name: 'getContext',
      success(res) {
        // console.log(res)
        wx.setStorageSync('openid', res.result.openid);
      }
    });
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
    let newDay = this.getToday();
    let list = wx.getStorageInfoSync().keys;
    let ifToday = list.find(item => {
      return item == "today"
    });
    // console.log(ifToday)
    if (ifToday == undefined) {
      wx.setStorageSync('today', that.getToday());
      wx.setStorageSync('isNew', true);
      wx.setStorageSync('toast_num', 0);
      // wx.setStorageSync('fresh', 0);
      wx.setStorageSync('set_phone', 0);
    }else{
      let today = wx.getStorageSync('today');
      // console.log(today)
      wx.setStorageSync('today', that.getToday());
      if(newDay.date==today.date){
        wx.setStorageSync('isNew', false)//用于判断今天是不是新的一天，是则为true，不是则为false
      }else{
        wx.setStorageSync('isNew', true);
        wx.setStorageSync('set_phone', 0);//用于计算设置手机号次数
        wx.setStorageSync('toast_num', 0);//用于计算提醒打卡可用提醒次数，最多5次
        // wx.setStorageSync('fresh', 0);
      }
    }
    
    // wx.cloud.callFunction({
    //   name: 'getMonthCard',
    //   data:{
    //     year:newDay.year
    //   },
    //   success(res) {
    //     // console.log(res)
    //     wx.setStorageSync('detail', res.result)
    //   },
    //   fail(res) {
    //     console.log(res)
    //   }
    // })
    this.globalData = {
      imgURL: 'cloud://position-9cjeb.706f-position-9cjeb-1301301645/index-imgs/'
    }
  },
  
  //获取今天的数值
  getToday() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let hour = today.getHours();
    let date = today.getDate();
    let weekday = today.getDay();
    let str_dot = this.overTen(year) + '.' + this.overTen(month) + '.' + this.overTen(date);
    let str_num = this.overTen(year) + '-' + this.overTen(month) + '-' + this.overTen(date);
    let str_ch = this.overTen(year) + '年' + this.overTen(month) + '月' + this.overTen(date) + '日';
    return {
      year: year,
      month: month,
      date: date,
      hour: hour,
      weekday: weekList[weekday],
      weekday_num: weekday,
      str_dot: str_dot,
      str_num: str_num,
      str_ch: str_ch
    }
  },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return num;
    }
  }
})
