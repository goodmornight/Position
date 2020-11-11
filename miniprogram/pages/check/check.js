// pages/check/check.js
import Notify from '../../dist/notify/notify';
import Dialog from '../../dist/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBind: false,
    openid: '',
    currentData: 0, //确定用户信息，0为身份验证，1为手机绑定
    phoneNumCurrentData: 0, //绑定手机号码，0为微信授权页面，1为短信验证码
    name: '', //姓名
    idNum: '', //学号
    phoneNum: '', //手机号
    phoneNum_new:'',//短信验证那块的手机号
    testNum:'',//用户写的验证码
    classA: '',
    classB: '',
    classC: '',
    isGetText:true,//是否可以发送验证码，true可以点击该按钮发送短信
    inputText:'发送验证码',//按钮内显示文字
    isGetText_today:true,//今天是否可以发送验证码，true可以点击该按钮发送短信
    ifSubmit:true,//是否可点击验证身份
    ifChange:true,//是否可以点击短信验证码确定按钮
    checkBox:[],//选择同意的协议
    nameInput:'',//输入的姓名
    idInput:''//输入的学号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    let that = this;
    let openid = wx.getStorageSync('openid');
    let isBind = wx.getStorageSync('isBind');
    const db = wx.cloud.database();
    const user_1 = db.collection('user-1');
    
    this.setData({
      isBind: isBind,
      openid: openid
    })
    
    if (isBind) {
      let user = wx.getStorageSync('user');
      Notify({
        message: '该身份已绑定手机号:'+user.phoneNum.substring(0,3)+'****'+user.phoneNum.substring(11-4),
        color: '#ffffff',
        background: '#576b95',
        duration: 4000
      });
      that.setData({
        // currentData: 1,
        classA: user.classA,
        classB: user.classB,
        classC: user.classC,
        name: user.name,
        idNum: user.idNum,
        phoneNum: user.phoneNum
      })
      
    }else{
      user_1.where({
        _openid:openid
      }).get({
        success(res){
          // console.log(res);
          if(res.data.length>0){
            wx.reLaunch({
              url: '../index/index',
            })
          }
        }
      })
    }
    
  },
  //输入的名字
  onNameInput(event){
    let that = this;
    this.setData({
      nameInput:event.detail.value
    });
    let nameInput = this.data.nameInput;
    let idInput = this.data.idInput;
    let checkBox = this.data.checkBox;
    if(nameInput!=''&&idInput!=''&&checkBox.length==2){
      that.setData({
        ifSubmit:false
      })
    }else{
      that.setData({
        ifSubmit:true
      })
    }
  },
  //输入的学号
  onIdInput(event){
    let that = this;
    this.setData({
      idInput:event.detail.value
    });
    let nameInput = this.data.nameInput;
    let idInput = this.data.idInput;
    let checkBox = this.data.checkBox;
    if(nameInput!=''&&idInput!=''&&checkBox.length==2){
      that.setData({
        ifSubmit:false
      })
    }else{
      that.setData({
        ifSubmit:true
      })
    }
  },
  //同意的协议
  onCheckBoxChange(event){
    let that = this;
    this.setData({
      checkBox: event.detail
    });
    let nameInput = this.data.nameInput;
    let idInput = this.data.idInput;
    let checkBox = this.data.checkBox;
    if(nameInput!=''&&idInput!=''&&checkBox.length==2){
      that.setData({
        ifSubmit:false
      })
    }else{
      that.setData({
        ifSubmit:true
      })
    }
  },
  toProtocol(){
    wx.navigateTo({
      url: '../protocol/protocol',
    })
  },
  toPrivacy(){
    wx.navigateTo({
      url: '../privacy/privacy',
    })
  },
  //取消swiper的滑动操作
  stopTouchMove(event) {
    return false;
  },
  //身份验证
  idFormSubmit:function(e) {
    console.log(e)
    let that = this;
    let set_phone = wx.getStorageSync('set_phone');
    let name_input = e.detail.value.name;
    let idNum_input = e.detail.value.idNum;
    let name = this.data.name;
    let idNum = this.data.idNum;
    let openid = this.data.openid;
    let isBind = this.data.isBind; //是否绑定
    const db = wx.cloud.database();
    const user = db.collection('user');
    const user_1 = db.collection('user-1');
    if (isBind) { //已绑定
      if (name_input == name && idNum_input == idNum) {
        Notify({
          message: '身份验证成功',
          color: '#ffffff',
          background: '#576b95'
        });
        that.setData({
          currentData: 1
        });
        if(set_phone>=3&&that.data.currentData==1){
          that.setData({
            isGetText_today:false
          })
          Notify({
            message: '一天可用短信绑定手机号次数为3次',
            color: '#ffffff',
            background: '#c02c38'
          });
        }
      } else {
        if (name_input != "" && idNum_input!= "") {
          user.where({
            name: name_input,
            number: idNum_input
          })
          // .get().then(async function(res){
          //   if (res.data.length == 0) {
          //     console.log('身份验证失败，请重试')
          //     Notify({
          //       message: '信息错误，请重新输入。',
          //       color: '#ffffff',
          //       background: '#c02c38'
          //     });
          //   }else{
          //     await user_1.where({
          //       // _openid:openid
          //       // name: name_input,
          //       number: idNum_input
          //     }).get().then((check_res)=>{
          //       console.log(check_res)
          //     })
          //   }
          // })
          .get({
            success(res){
              console.log(res)
              if (res.data.length == 0) {
                console.log('身份验证失败，请重试')
                Notify({
                  message: '信息错误，请重新输入。',
                  color: '#ffffff',
                  background: '#c02c38'
                });
              }else{
                user_1.where({
                  // name: name_input,
                  number: idNum_input
                }).get({
                  success(check_res) {
                    console.log(check_res)
                    if(check_res.data.length==0){
                      wx.cloud.callFunction({
                        name:"updateUserInfo",
                        data:{
                          classA: res.data[0].classA,
                          classB: res.data[0].classB,
                          classC: res.data[0].classC,
                          name: name_input,
                          number: idNum_input
                        },
                        success(update_res){
                          console.log(update_res)
                          if(update_res.result.stats.updated==1){
                            that.setData({
                              classA: res.data[0].classA,
                              classB: res.data[0].classB,
                              classC: res.data[0].classC,
                              name: name_input,
                              idNum: idNum_input,
                              currentData: 1
                            });
                            Notify({
                              message: '身份验证成功',
                              color: '#ffffff',
                              background: '#576b95'
                            });
                            if(set_phone>=3&&that.data.currentData==1){
                              that.setData({
                                isGetText_today:false
                              })
                              Notify({
                                message: '一天可用短信绑定手机号次数为3次',
                                color: '#ffffff',
                                background: '#c02c38'
                              });
                            }
                          }else{
                            Notify({
                              message: '系统错误',
                              color: '#ffffff',
                              background: '#c02c38'
                            });
                          }
                        },
                        fail(update_res){
                          console.log(update_res);
                          Notify({
                            message: '系统错误',
                            color: '#ffffff',
                            background: '#c02c38'
                          });
                        }
                      })
                      // user_1.where({
                      //   _openid:openid
                      // }).update({
                      //   data:{
                      //     classA: res.data[0].classA,
                      //     classB: res.data[0].classB,
                      //     classC: res.data[0].classC,
                      //     name: name_input,
                      //     number: idNum_input
                      //   },
                      //   success(change_res){
                      //     console.log(change_res)
                      //     that.setData({
                      //       classA: res.data[0].classA,
                      //       classB: res.data[0].classB,
                      //       classC: res.data[0].classC,
                      //       name: name_input,
                      //       idNum: idNum_input,
                      //       currentData: 1
                      //     })
                      //     Notify({
                      //       message: '身份验证成功',
                      //       color: '#ffffff',
                      //       background: '#576b95'
                      //     });
                      //   },
                      //   fail(change_res){
                      //     console.log(change_res)
                      //     Notify({
                      //       message: '系统故障',
                      //       color: '#ffffff',
                      //       background: '#c02c38'
                      //     });
                      //   }
                        
                      // })
                    }else{
                      //弹出弹窗警告该身份已被绑定
                      Dialog.confirm({
                        title: '警告',
                        message: '该身份已被认证，如非本人操作请拨打电话：15631906569，或点击下方【联系客服】进行反馈。',
                        confirmButtonText:"联系客服",
                        confirmButtonColor:"#576b95",
                        confirmButtonOpenType:"contact"
                      }).then(() => {
                        // on confirm
                      }).catch(() => {
                        // on cancel
                        // wx.reLaunch({
                        //   url: '../index/index',
                        // })
                      });
                    }
                  }
                })
              }
            }
          })
        }else{
          Notify({
            message: '信息错误，请重新输入。',
            color: '#ffffff',
            background: '#c02c38'
          });
        }
       
      }
    } else { //未绑定
      if (name_input != "" && idNum_input!= "") {
        
        user.where({
            name: name_input,
            number: idNum_input
          })
          .get({
            success(res) {
              // console.log(res.data)
              if (res.data.length == 0) {
                console.log('身份验证失败，请重试')
                Notify({
                  message: '信息错误，请重新输入。',
                  color: '#ffffff',
                  background: '#c02c38'
                });
              } else {
                user_1.where({
                  name: name_input,
                  number: idNum_input
                }).get({
                  success(check_res) {
                    console.log(check_res);
                    if(check_res.data.length==0){
                      that.setData({
                        classA: res.data[0].classA,
                        classB: res.data[0].classB,
                        classC: res.data[0].classC,
                        name: name_input,
                        idNum: idNum_input,
                        currentData: 1
                      })
                      Notify({
                        message: '身份验证成功',
                        color: '#ffffff',
                        background: '#576b95'
                      });
                      if(set_phone>=3&&that.data.currentData==1){
                        that.setData({
                          isGetText_today:false
                        })
                        Notify({
                          message: '一天可用短信绑定手机号次数为3次',
                          color: '#ffffff',
                          background: '#c02c38'
                        });
                      }
                    }else{
                      //弹出弹窗警告该身份已被绑定
                      Dialog.confirm({
                        title: '警告',
                        message: '该身份已被认证，如非本人操作请拨打电话：15631906569，或点击下方【联系客服】进行反馈。',
                        confirmButtonText:"联系客服",
                        confirmButtonColor:"#576b95",
                        confirmButtonOpenType:"contact"
                      }).then(() => {
                        // on confirm
                      }).catch(() => {
                        // on cancel
                        // wx.reLaunch({
                        //   url: '../index/index',
                        // })
                      });
                    }
                  }
                })
                
              }
            },
            fail(res) {
              Notify({
                message: '系统错误',
                color: '#ffffff',
                background: '#c02c38'
              });
            }
          })
      } else {
        let mes = "";
        if (name_input == "") {
          mes = "请输入姓名"
        } else if (idNum_input== "") {
          mes = "请输入正确的学号"
        }
        Notify({
          message: mes,
          color: '#ffffff',
          background: '#c02c38'
        });
      }
    }
  },
  toMessage() {
    this.setData({
      phoneNumCurrentData: 1
    })
  },
  getPhoneNumber(e) {
    let that = this;
    let isBind = this.data.isBind;
    let openid = this.data.openid;
    let name = this.data.name;
    let idNum = this.data.idNum;
    let classA = this.data.classA;
    let classB = this.data.classB;
    let classC = this.data.classC;
    let phoneNum_origin = '';
    let phoneNum = '';

    wx.cloud.callFunction({
      name: 'getcellphone',
      data: {
        id: wx.cloud.CloudID(e.detail.cloudID)
      },
      success(res) {
        phoneNum = res.result;
        //已绑定
        if (isBind) {
          phoneNum_origin = that.data.phoneNum;
          if (phoneNum == phoneNum_origin) {
            //手机号不变
            Notify({
              message: '您已绑定该手机号',
              color: '#ffffff',
              background: '#576b95'
            });
          } else {
            //手机号变了
            const db = wx.cloud.database();
            const user_1 = db.collection('user-1');
            user_1.where({
              _openid: openid
            }).update({
              data: {
                phone: phoneNum
              },
              success(res) {
                Notify({
                  message: '手机号修改成功',
                  color: '#ffffff',
                  background: '#576b95'
                });
              },
              fail(res) {
                Notify({
                  message: '手机号修改失败',
                  color: '#ffffff',
                  background: '#c02c38'
                });
              }
            })
          }

        } else {
          //未绑定
          //将用户数据存入数据库
          const db = wx.cloud.database();
          const user_1 = db.collection('user-1');
          user_1.add({
            data: {
              createTime: new Date().getTime().toString(),
              classA: classA,
              classB: classB,
              classC: classC,
              name: name,
              number: idNum,
              phone: phoneNum,
              isPushed: false,//当天是否打卡，需要云函数每日更新
              pushTimes: 0
            },
            success(res) {
              console.log('录入用户数据成功');
              Notify({
                message: '手机号绑定成功',
                color: '#ffffff',
                background: '#576b95'
              });
              // wx.reLaunch({
              //   url: '../index/index',
              // })
            },
            fail(res) {
              console.log('录入用户数据失败');
              Notify({
                message: '手机号绑定失败',
                color: '#ffffff',
                background: '#c02c38'
              });
            }
          })
          that.setData({
            phoneNum: phoneNum
          })
        }
        // console.log(res);
        wx.reLaunch({
          url: '../index/index',
        })
      },
      fail(res) {
        Notify({
          message: '已拒绝微信授权',
          color: '#ffffff',
          background: '#c02c38'
        });
        console.log('手机号获取云函数失败');
        console.log(res)
      }
    })
  },
  phoneNumInput(e){
    let that = this;
    this.setData({
      phoneNum_new:e.detail.value
    });
    let phoneNum_new = that.data.phoneNum_new;
    let testNum = that.data.testNum;
    
    if(phoneNum_new.length==11&&testNum.length>0){
      that.setData({
        ifChange:false
      })
    }else{
      that.setData({
        ifChange:true
      })
    }
  },
  testNumInput(e){
    let that = this;
    this.setData({
      testNum:e.detail.value
    })
    let phoneNum_new = that.data.phoneNum_new;
    let testNum = that.data.testNum;
    if(phoneNum_new.length==11&&testNum.length>0){
      that.setData({
        ifChange:false
      })
    }else{
      that.setData({
        ifChange:true
      })
    }
  },
  //点击发送验证码按钮
  toGetTestNum(){
    let that = this;
    let set_phone = wx.getStorageSync('set_phone');
    
    const db = wx.cloud.database();
    const user_1 = db.collection('user-1');
    let phoneNum_new = this.data.phoneNum_new;
    let phoneNum = this.data.phoneNum;
    // console.log(phoneNum_new)
    if(phoneNum_new.length!=11){
      Notify({
        message: '手机号填写错误，请重新填写',
        color: '#ffffff',
        background: '#c02c38'
      });
    }else{
      if(phoneNum==phoneNum_new){
        Notify({
          message: '您已绑定该手机号',
          color: '#ffffff',
          background: '#576b95'
        });
      }else{
        if(set_phone<3){
          set_phone+=1;
          wx.setStorageSync('set_phone', set_phone);
          
          user_1.where({
            phone:phoneNum_new
          }).get({
            success(res){
              // console.log(res)
              if(res.data.length>0){
                Notify({
                  message: '该手机号已绑定其他身份，请重新输入',
                  color: '#ffffff',
                  background: '#c02c38'
                });
              }else{
                let second = 60;
                const timer = setInterval(() => {
                  second--;
                  if (second) {
                    that.setData({
                      isGetText:false,
                      inputText:'重新发送('+second+'s)'
                    })
                  } else {
                    that.setData({
                      isGetText:true,
                      inputText:'发送验证码'
                    })
                    clearInterval(timer);
                  }
                }, 1000);
                wx.cloud.callFunction({
                  name:"sendPhoneText",
                  data:{
                    phone:phoneNum_new
                    // phone:["+86"+"13060370225"]
                  },
                  success(res){
                    // console.log(res);
                    let errMsg = res.result.errMsg.substring(res.result.errMsg.length-2);
                    // console.log(errMsg)
                    if(errMsg=='ok'){
                      
                      Notify({
                        message: '验证码已发送',
                        color: '#ffffff',
                        background: '#576b95'
                      });
                      
                    }else{
                      Notify({
                        message: '验证码发送失败',
                        color: '#ffffff',
                        background: '#c02c38'
                      });                  
                    }
                    
                  },
                  fail(res){
                    console.log(res);
                    Notify({
                      message: '验证码发送失败',
                      color: '#ffffff',
                      background: '#c02c38'
                    });
                  }
                })
              }
            },
            fail(res){
              console.log(res);
              Notify({
                message: '系统错误',
                color: '#ffffff',
                background: '#c02c38'
              });
            }
            
          })
        }else{
          that.setData({
            isGetText_today:false,
            phoneNumCurrentData: 0
          })
          Notify({
            message: '一天可用短信绑定手机号次数为3次',
            color: '#ffffff',
            background: '#c02c38'
          });
        }
      }
    }
  },
  cellphoneFormSubmit(e) {
    // console.log(e);
    let that = this;

    let openid = this.data.openid;
    let isBind = this.data.isBind;
    let name = this.data.name;//姓名
    let idNum = this.data.idNum;//学号
    let classA = this.data.classA;
    let classB = this.data.classB;
    let classC = this.data.classC;
    let phoneNum = e.detail.value.phoneNum;
    let testNum = e.detail.value.testNum;//用户写的验证码
    wx.cloud.callFunction({
      name:"changeCellPhone",
      data:{
        isBind:isBind,
        classA: classA,
        classB: classB,
        classC: classC,
        name: name,
        number: idNum,
        phone:phoneNum,
        code:testNum
      },
      success(res){
        // console.log(res);
        
        let result = res.result;
        let add = result.add;
        let code = result.code;
        let inTime = result.inTime;
        let remove = result.remove;
        let update = result.update;
        if(inTime&&code){
          if(add){
            Notify({
              message: '手机号绑定成功',
              color: '#ffffff',
              background: '#576b95'
            });
          }else{
            Notify({
              message: '手机号修改成功',
              color: '#ffffff',
              background: '#576b95'
            });
          }
          wx.reLaunch({
            url: '../index/index',
          })
        }else{
          Notify({
            message: '验证码错误',
            color: '#ffffff',
            background: '#c02c38'
          });
        }
      },
      fail(res){
        console.log(res)
        Notify({
          message: '手机号绑定失败',
          color: '#ffffff',
          background: '#c02c38'
        });
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

  }
})