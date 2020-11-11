// pages/form/form.js
import Notify from '../../dist/notify/notify';
import Dialog from '../../dist/dialog/dialog';
const healthRadioList = [{
  id: "0",
  content: "体温高于37.3℃"
}, {
  id: "1",
  content: "体温低于37.3℃，有乏力、干咳等其他不适症状"
}, {
  id: "2",
  content: "体温低于37.3℃，且无不适症状"
}];
const healthList_short = ['高于37.3℃', '低于37.3℃,不适', '低于37.3℃,无不适'];
const daysRadioList = [{
  id: "0",
  content: "有疫区旅居史"
}, {
  id: "1",
  content: "接触过流行病高发地区（湖北省）人员"
}, {
  id: "2",
  content: "接触过疑似患者"
}, {
  id: "3",
  content: "接触过确诊患者"
}, {
  id: "4",
  content: "无以上情况"
}];
const daysList_short = ['有疫区旅居史', '接触过流行病高发地区人员', '接触过疑似患者', '接触过确诊患者', '无以上情况'];
const hospitalRadioList = [{
  id: "0",
  content: "确诊为肺炎患者"
}, {
  id: "1",
  content: "确诊为非肺炎患者"
}, {
  id: "2",
  content: "确诊为肺炎患者，已经治愈出院"
}, {
  id: "3",
  content: "无"
}];
const hospitalList_short = ['确诊为肺炎患者', '确诊为非肺炎患者', "确诊为肺炎患者，已治愈出院", "无"];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    healthList_short:healthList_short,
    today: {},
    isToday: false, //判断缓存内数据是否是今天是否禁用，false为不禁用
    locationEnd:false,//判断location是否处理完毕
    loading_show:false,//加载动画是否出现
    //form_btn: true, //判断表是否填完，是否禁用，false为不禁用
    healthRadioList: healthRadioList,
    daysRadioList: daysRadioList,
    hospitalRadioList: hospitalRadioList,
    // check_show:false,
    // popup_health_show: false,
    // popup_14Days_show: false,
    // popup_hospital_show: false,
    healthRadio: "",
    daysRadio: "",
    hospitalRadio: "",
    addressInfo: {
      location:{},
      address:''
    }, //获得的定位位置
    healthIndex: 0,
    health: {}, //身体状况
    daysDiff: {}, //14天内
    hospital: {}, //就医记录
    trafficContent: "", //乘坐交通工具文本
    otherContent: "", //其他情况
    regionalIndex:Math.floor(Math.random()*10+20),//地区易感指数
    finalRes: {},
    setting_show: false, //如果用户之前拒绝授权地理位置信息，调用
    confirm_show: false, //最后用户确认信息
    sendSetting_show: false,
    activeName: '0',
    isDistancegt1: false,//李佳计算数据
    hasSick: false,//李佳计算数据
    covIndex:0//李佳计算数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let today = this.getToday();
    this.setData({
      today: today
    });
    let isBind = wx.getStorageSync('isBind');
    if(!isBind){
      Dialog.confirm({
        message: '为了更好的确认身份和发送短信提醒打卡，\n请您进行身份验证和手机号码绑定。'
      }).then(() => {
        // on confirm
        wx.reLaunch({
          url: '../check/check',
        })
      }).catch(() => {
        // on cancel
        wx.reLaunch({
          url: '../index/index',
        })
        // wx.reLaunch({
        //   delta:1,
        // })
      });
      // wx.redirectTo({
      //   url: '../check/check',
      // })
    }
    
    let findRes = wx.getStorageInfoSync().keys;
    let isFindRes = findRes.find(item => {
      return item == "finalRes"
    });
    if (isFindRes != undefined) {
      let finalRes = wx.getStorageSync("finalRes");

      if (today.str_num == finalRes.today.str_num) {
        //日期相等的时候
        that.setData({
          addressInfo: finalRes.addressInfo,
          health: finalRes.health,
          daysDiff: finalRes.daysDiff,
          hospital: finalRes.hospital,
          trafficContent: finalRes.trafficContent,
          otherContent: finalRes.otherContent,
          healthRadio: finalRes.health.origin_content.id,
          daysRadio: finalRes.daysDiff.origin_content.id,
          hospitalRadio: finalRes.hospital.origin_content.id,
          regionalIndex: finalRes.regionalIndex,
          isToday: true
        })

      } else {
        //日期不等的时候,更新表
        that.setData({
          health: finalRes.health,
          daysDiff: finalRes.daysDiff,
          hospital: finalRes.hospital,
          healthRadio: finalRes.health.origin_content.id,
          daysRadio: finalRes.daysDiff.origin_content.id,
          hospitalRadio: finalRes.hospital.origin_content.id,
          isToday: false
        })
      }
    }
  },
  onChange(event) {
    let that = this;
    this.setData({
      activeName: event.detail
    });
    
  },
  toCompleted(e) {
    let that = this;
    this.setData({
      activeName:'0'
    })
    let mes = "";
    let address = this.data.addressInfo.address;
    let health = this.data.health;
    let daysDiff = this.data.daysDiff;
    let hospital = this.data.hospital;
    if (address == "" || health.short_content == null || daysDiff.short_content == null || hospital.short_content == null) {
      if (address == "") {
        mes = "'所在地点'未获取";
      }
      if (health.short_content == null) {
        mes = "'身体状况'未填";
      }
      if (daysDiff.short_content == null) {
        mes = "'14天内是否有以下情况'未填";
      }
      if (hospital.short_content == null) {
        mes = "'就医记录'未填";
      }
      Notify({
        message: mes,
        color: '#ffffff',
        background: '#c02c38'
      });

    } else {
      let result = {
        today: that.data.today,
        addressInfo: that.data.addressInfo,
        health: that.data.health,
        daysDiff: that.data.daysDiff,
        hospital: that.data.hospital,
        trafficContent: that.data.trafficContent,
        otherContent: that.data.otherContent,
        regionalIndex:that.data.regionalIndex,
        covIndex:that.data.covIndex,
        isDistancegt1: that.data.isDistancegt1,
        hasSick: that.data.hasSick
      }
      that.setData({
        finalRes: result,
        confirm_show: true
      })
    }
  },
  //所在地点定位
  onLocation:function() {
    //还没写存到数据库部分，以及缓存部分
    let that = this;
    let isToday = this.data.isToday;
    let tasks = [];
    if(!isToday){
      that.setData({
        loading_show:true
      })
      // let location = await that.getLocation_pro().then(location=>{

      // });
      // //用于计算个人易感指数
      // wx.cloud.callFunction({
      //   name:"covIndexCalculate",
      //   data:{
      //     longitude: longitude,
      //     latitude: latitude,
      //     adcode:adcode
      //   }
      // }).then(cov_res => {
      //   // console.log(res);
      //   that.setData({
      //     covIndex:cov_res.result.index,
      //     isDistancegt1: cov_res.result.isDistancegt1,
      //     hasSick: cov_res.result.hasSick
      //   })
      // })
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          // console.log(res)
          const latitude = res.latitude;
          const longitude = res.longitude;
          wx.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=6DBBZ-MZH6O-KSSW2-SV2JB-RH7IZ-E2BJG&get_poi=0',
            success(res) {
              // console.log(res)
              let nation_code = res.data.result.ad_info.nation_code;
              let adcode="";
              if(nation_code=="156"){
                adcode = res.data.result.ad_info.adcode;
              }
              
              let address = res.data.result.address;
              that.setData({
                addressInfo: {
                  location: {
                    longitude: longitude,
                    latitude: latitude,
                    adcode:adcode
                  },
                  address: address
                }
              })
              //用于计算个人易感指数
              // const covIndexCalculate =that.covIndexCalculate_pro(longitude,latitude,adcode);
              wx.cloud.callFunction({
                name:"covIndexCalculate",
                data:{
                  longitude: longitude,
                  latitude: latitude,
                  adcode:adcode
                }
              }).then(cov_res => {
                // console.log(res);
                that.setData({
                  covIndex:cov_res.result.index,
                  isDistancegt1: cov_res.result.isDistancegt1,
                  hasSick: cov_res.result.hasSick
                });
                wx.cloud.callFunction({
                  name: 'getRegionalIndex',
                  data:{
                    longitude: longitude,
                    latitude: latitude,
                    districtCode:adcode
                  }
                }).then(reg_res => {
                  // console.log(res);
                  that.setData({
                    regionalIndex:reg_res.result.result,
                    
                    loading_show:false
                  });
                  let address = that.data.addressInfo.address;
                  let health = that.data.health;
                  let daysDiff = that.data.daysDiff;
                  let hospital = that.data.hospital;
                  console.log(health.short_content)
                  if (address != "" && health.short_content != null && daysDiff.short_content != null &&hospital.short_content != null){
                    that.setData({
                      locationEnd:true
                    })
                  } 
                });
              }).catch((err)=>{
                console.log(err)
                wx.cloud.callFunction({
                  name: 'getRegionalIndex',
                  data:{
                    longitude: longitude,
                    latitude: latitude,
                    districtCode:adcode
                  }
                }).then(reg_res => {
                  // console.log(res);
                  that.setData({
                    regionalIndex:reg_res.result.result,
                    // locationEnd:true,
                    loading_show:false
                  })
                  let address = that.data.addressInfo.address;
                  let health = that.data.health;
                  let daysDiff = that.data.daysDiff;
                  let hospital = that.data.hospital;
                  if (address != "" && health.short_content != null && daysDiff.short_content != null &&hospital.short_content != null){
                    that.setData({
                      locationEnd:true
                    })
                  } 
                });
              });
              // tasks.push(covIndexCalculate);
              // const getRegionalIndex = that.getRegionalIndex_pro(longitude,latitude,adcode);
              // wx.cloud.callFunction({
              //   name: 'getRegionalIndex',
              //   data:{
              //     longitude: longitude,
              //     latitude: latitude,
              //     districtCode:adcode
              //   }
              // }).then(reg_res => {
              //   // console.log(res);
              //   that.setData({
              //     regionalIndex:reg_res.result.result
              //   })
              // });
              // tasks.push(getRegionalIndex);
              // await Promise.all(tasks).then((res)=>{
              //   console.log(res)
              // })
            },
            fail(res) {
              console.log(res)
            }
          });
          
        },
        fail(res) {
          console.log(res)
          that.setData({
            setting_show: true
          });
        }
      })
    }
    
  },
  getRegionalIndex_pro:function(longitude,latitude,adcode){
    let that = this;
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: 'getRegionalIndex',
        data:{
          longitude: longitude,
          latitude: latitude,
          districtCode:adcode
        }
      }).then(reg_res => {
        // console.log(res);
        that.setData({
          regionalIndex:reg_res.result.result
        })
        resolve();
      });
    })
  },
  covIndexCalculate_pro:function(longitude,latitude,adcode){
    let that = this;
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name:"covIndexCalculate",
        data:{
          longitude: longitude,
          latitude: latitude,
          adcode:adcode
        }
      }).then(cov_res => {
        // console.log(res);
        that.setData({
          covIndex:cov_res.result.index,
          isDistancegt1: cov_res.result.isDistancegt1,
          hasSick: cov_res.result.hasSick
        });
        resolve()
      })
    })
  },
  getLocation_pro:function(){
    let that = this;
    return new Promise(function (resolve, reject) {
      wx.getLocation({
        type: 'wgs84',
        success (res) {
          const latitude = res.latitude;
          const longitude = res.longitude;
          let adcode="";
          wx.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=6DBBZ-MZH6O-KSSW2-SV2JB-RH7IZ-E2BJG&get_poi=0',
            success(res) {
              // console.log(res)
              let nation_code = res.data.result.ad_info.nation_code;
              
              if(nation_code=="156"){
                adcode = res.data.result.ad_info.adcode;
              }
              let address = res.data.result.address;
              that.setData({
                addressInfo: {
                  location: {
                    longitude: longitude,
                    latitude: latitude,
                    adcode:adcode
                  },
                  address: address
                }
              })
              resolve({
                longitude: longitude,
                latitude: latitude,
                adcode:adcode
              })
            },
            fail(res) {
              console.log(res)
              resolve({
                longitude: longitude,
                latitude: latitude,
                adcode:adcode
              })
            }
          });
        },
        fail(res) {
          console.log(res)
          that.setData({
            setting_show: true
          });
          resolve({
            longitude: 0,
            latitude: 0,
            adcode:""
          })
        }
       })       
    })
  },

  //控制身体状况下弹窗显示-单选框控制
  onHealthRadioChange(e) {
    // let that = this;
    let index = healthRadioList.findIndex(function(item) {
      return item.id == e.detail;
    });
    this.setData({
      healthRadio: e.detail,
      health: {
        index: index,
        short_content: healthList_short[index],
        origin_content: healthRadioList[index]
      }
    });
    
  },
  onHealthRadioClick(e) {
    const {
      name
    } = e.currentTarget.dataset;
    let that = this;
    let index = healthRadioList.findIndex(function(item) {
      return item.id == name;
    });
    // console.log(e)
    this.setData({
      healthRadio: name,
      health: {
        index: index,
        short_content: healthList_short[index],
        origin_content: healthRadioList[index]
      }
    });
    let address = this.data.addressInfo.address;
    let health = this.data.health;
    let daysDiff = this.data.daysDiff;
    let hospital = this.data.hospital;
    if (address != "" && health.short_content != null && daysDiff.short_content != null && hospital.short_content != null) {
      that.setData({
        locationEnd:true
      })
    }
  },

  //控制14天内下弹窗显示-单选框控制
  on14DaysRadioChange(e) {
    let that = this;
    let index = daysRadioList.findIndex(function(item) {
      return item.id == e.detail;
    });
    this.setData({
      daysRadio: e.detail,
      daysDiff: {
        index: index,
        short_content: daysList_short[index],
        origin_content: daysRadioList[index]
      }
    });
    
  },
  on14DaysRadioClick(e) {
    const {
      name
    } = e.currentTarget.dataset;
    let that = this;
    let index = daysRadioList.findIndex(function(item) {
      return item.id == name;
    });
    this.setData({
      daysRadio: name,
      daysDiff: {
        index: index,
        short_content: daysList_short[index],
        origin_content: daysRadioList[index]
      }
    });
    let address = this.data.addressInfo.address;
    let health = this.data.health;
    let daysDiff = this.data.daysDiff;
    let hospital = this.data.hospital;
    if (address != "" && health.short_content != null && daysDiff.short_content != null && hospital.short_content != null) {
      that.setData({
        locationEnd:true
      })
    }
  },

  //控制就医情况下弹窗显示-单选框控制
  onHospitalRadioChange(e) {
    let that = this;
    let index = hospitalRadioList.findIndex(function(item) {
      return item.id == e.detail;
    });
    this.setData({
      hospitalRadio: e.detail,
      hospital: {
        index: index,
        short_content: hospitalList_short[index],
        origin_content: hospitalRadioList[index]
      }
    });
    
  },
  onHospitalRadioClick(e) {
    const {
      name
    } = e.currentTarget.dataset;
    let that = this;
    let index = hospitalRadioList.findIndex(function(item) {
      return item.id == name;
    });
    this.setData({
      hospitalRadio: name,
      hospital: {
        index: index,
        short_content: hospitalList_short[index],
        origin_content: hospitalRadioList[index]
      }
    });
    let address = this.data.addressInfo.address;
    let health = this.data.health;
    let daysDiff = this.data.daysDiff;
    let hospital = this.data.hospital;
    if (address != "" && health.short_content != null && daysDiff.short_content != null && hospital.short_content != null) {
      that.setData({
        locationEnd:true
      })
    }
  },
  onInputTraffic(e) {
    // console.log(e.detail)
    this.setData({
      trafficContent: e.detail.value
    })
  },
  onInputOthers(e) {
    // console.log(e.detail)
    this.setData({
      otherContent: e.detail.value
    })
  },
  //授权按钮进入设置授权页面
  onSetting() {
    let that = this;
    wx.openSetting({
      success(res) {
        console.log(res)
      },
      fail(res) {
        console.log(res)
      },
      complete(res) {
        console.log(res);
        that.setData({
          setting_show: false,
          sendSetting_show: false
        })
      }
    })
  },
  onSettingClose() {
    this.setData({
      setting_show: false
    })
  },
  onConfirm:function() {
    let that = this;
    let today = this.data.today;
    let finalRes = this.data.finalRes;
    let createTime_str = new Date();
    let createTime = createTime_str.getTime();
    let user = wx.getStorageSync('user');
    const db = wx.cloud.database();
    const _ = db.command;
    const user_1 = db.collection('user-1');
    const report = db.collection('report');

    wx.setStorageSync('finalRes', that.data.finalRes);
    
    report.add({
      data: {
        createTime_num: createTime,
        createTime: createTime.toString(), //创建时间
        createTime_str: createTime_str,//方便读取时间
        phone: user.phoneNum, //手机号，可填可不填
        adcode: finalRes.addressInfo.location.adcode,//行政区代码
        location: db.Geo.Point(finalRes.addressInfo.location.longitude, finalRes.addressInfo.location.latitude), //地理位置
        address: finalRes.addressInfo.address, //地理位置文本
        sick: (finalRes.hospital.index == 0), //是否患病
        subversionStatus: finalRes.hospital.origin_content.content, //就医记录文本
        isSymptom: (finalRes.health.index != 2), // 是否出现症状,对应打卡信息中的“身体状况”，单项选择的0，1为true， 2为false
        isTravel: (finalRes.trafficContent != ''), // 是否出行（指离开所在地）
        status: finalRes.daysDiff.origin_content.content, // 对应打卡信息中的"本人14天内是否有以下情况"
        travelNumber: finalRes.trafficContent, // 航班号/列车车次/汽车车牌号
        extra: finalRes.otherContent, // 对应打卡信息中的 “是否有其他与疫情相关的、值得注意的情况？”
        regionalIndex: finalRes.regionalIndex, // 地区易感指数
        covIndex:finalRes.covIndex,//新计算的易感指数用于服务器
        isDistancegt1: finalRes.isDistancegt1,
        hasSick: finalRes.hasSick
      },
      success(res) {
        console.log('打卡数据上传成功');
        // console.log(res);
        user_1.where({
          phone: user.phoneNum
        }).update({
          data: {
            isPushed:true
          },
          success(update_res){
            // console.log(res)
            that.setData({
              confirm_show: false
            })
            Notify({
              message: '打卡成功',
              color: '#ffffff',
              background: '#576b95'
            });
          }
        })
      },
      fail(res) {
        Notify({
          message: '打卡失败，系统错误',
          color: '#ffffff',
          background: '#c02c38'
        });
      }
    })
    // that.setData({
    //   confirm_show: false
    // })
    if(user.phoneNum!=''){
      wx.requestSubscribeMessage({
        tmplIds: ['pw3_2EzrLjX5ezhxQaRYVYolzscsCMJ5SdGyQ4Ie5Ho'],
        success(res) {
          console.log(res);
          let mes = res.pw3_2EzrLjX5ezhxQaRYVYolzscsCMJ5SdGyQ4Ie5Ho;
          if (mes == 'accept') {
            //允许
            user_1.where({
              phone: user.phoneNum
            }).update({
              data:{
                pushTimes:_.inc(1)
              }
            }) 
          } else {
            //拒绝
            user_1.where({
              phone: user.phoneNum
            }).update({
              data: {
                pushTimes: 0
              }
            })
            that.setData({
              sendSetting_show: true
            })
          }
        },
        fail(res) {
          console.log(res);
          // Notify({
          //   message: '获取失败，系统错误',
          //   color: '#ffffff',
          //   background: '#c02c38'
          // });
        }
      })
      // user_1.where({
      //   phone: user.phoneNum
      // }).update({
      //   data: {
      //     isPushed:true
      //   }
      // })
    }
    wx.redirectTo({
      url: '../share/share?createTime=' + createTime + '&date='+today.date+ '&isToday=1',
    })
  },
  onConfirmHide() {
    this.setData({
      confirm_show: false
    })
  },
  // onSendSettingShow() {
  //   this.setData({
  //     sendSetting_show: false
  //   })
  //   wx.navigateTo({
  //     url: '../share/share',
  //   })
  // },
  getToday() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let hour = today.getHours();
    let date = today.getDate();
    let str_num = this.overTen(year) + '-' + this.overTen(month) + '-' + this.overTen(date);
    let str_ch = this.overTen(year) + '年' + this.overTen(month) + '月' + this.overTen(date) + '日';
    return {
      year: year,
      month: month,
      date: date,
      hour: hour,
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
    let that = this;
    let today = this.getToday();
    this.setData({
      today: today
    });
    let findRes = wx.getStorageInfoSync().keys;
    let isFindRes = findRes.find(item => {
      return item == "finalRes"
    });
    if (isFindRes != undefined) {
      let finalRes = wx.getStorageSync("finalRes");

      if (today.str_num == finalRes.today.str_num) {
        that.setData({
          addressInfo: finalRes.addressInfo,
          health: finalRes.health,
          daysDiff: finalRes.daysDiff,
          hospital: finalRes.hospital,
          trafficContent: finalRes.trafficContent,
          otherContent: finalRes.otherContent,
          healthRadio: finalRes.health.origin_content.id,
          daysRadio: finalRes.daysDiff.origin_content.id,
          hospitalRadio: finalRes.hospital.origin_content.id,
          isToday: true
        })

      } else {
        that.setData({
          health: finalRes.health,
          daysDiff: finalRes.daysDiff,
          hospital: finalRes.hospital,
          healthRadio: finalRes.health.origin_content.id,
          daysRadio: finalRes.daysDiff.origin_content.id,
          hospitalRadio: finalRes.hospital.origin_content.id,
          isToday: false
        })
      }
    }
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

  }
})