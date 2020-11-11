// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  const now = new Date().getTime()-8*60*60*1000;
  console.log(now)
  const isBind = event.isBind;//是否绑定
  const name = event.name;//姓名
  const phone_in = event.phone;//手机号
  const code_in = event.code;//验证码
  const number = event.number;//学号
  const classA = event.classA;
  const classB = event.classB;
  const classC = event.classC;

  const db = cloud.database();
  const _ = db.command;
  const user_1 = db.collection('user-1');
  const tempcode = db.collection('tempcode');
  
  return await tempcode.where({
    _openid:openid,
    createTime:_.gte(now-300000)
  }).get().then(async(res)=>{
    let data = res.data;
    if(data.length>0){
      let code = data[0].code;
      let phone = data[0].phone;
      if(code==code_in&&phone==phone_in){
        if(isBind){//已绑定
          return await user_1.where({
            _openid:openid
          }).update({
            data:{
              phone:phone
            }
          }).then(async(update_res)=>{
            console.log(update_res)
            if(update_res.stats.updated==1){
              return await tempcode.where({
                _openid: openid
              }).remove().then(async(remove_res)=>{
                console.log(remove_res)
                if(remove_res.stats.removed==1){
                  return{
                    inTime:true,//没超时
                    code:true,//验证码正确
                    add:false,//无添加
                    update:true,//更新成功
                    remove:true//删除成功
                  }
                }else{
                  return{
                    inTime:true,//没超时
                    code:true,//验证码正确
                    add:false,//无添加
                    update:true,//更新成功
                    remove:false//删除失败
                  }
                }
                
              })
            }else{
              return{
                inTime:true,//没超时
                code:true,//验证码正确
                add:false,//无添加
                update:false,//更新失败
                remove:false//删除失败
              }
            }
          })
        }else{//未绑定
          return await user_1.add({
            data:{
              _openid:openid,
              createTime:now.toString(),
              classA: classA,
              classB: classB,
              classC: classC,
              name: name,
              number: number,
              isPushed: false,//当天是否打卡，需要云函数每日更新
              pushTimes: 0,
              phone:phone,
            }
          }).then(async(add_res)=>{
            console.log(add_res)
            if(add_res.errMsg.substring(add_res.errMsg.length-2)=='ok'){
              return await tempcode.where({
                _openid: openid
              }).remove().then(async(remove_res)=>{
                console.log(remove_res)
                if(remove_res.stats.removed==1){
                  return{
                    inTime:true,//没超时
                    code:true,//验证码正确
                    add:true,//添加成功
                    update:false,//更新失败
                    remove:true//删除成功
                  }
                }else{
                  return{
                    inTime:true,//没超时
                    code:true,//验证码正确
                    add:true,//添加成功
                    update:false,//更新失败
                    remove:false//删除失败
                  }
                }
              })
            }else{
              return{
                inTime:true,//没超时
                code:true,//验证码正确
                add:false,//添加失败
                update:false,//更新失败
                remove:false//删除失败
              }
            }
          })
        }
        
      }else{
        return{
          inTime:true,//没有超时
          code:false,//验证码错误或手机号错误
          add:false,//无添加操作
          update:false,//无更新操作
          remove:false//无删除操作
        }
      }
    }else{
      return await tempcode.where({
        _openid:openid
      }).remove().then(async(remove_res)=>{
        if(remove_res.stats.removed==1){
          return{
            inTime:false,//超时
            code:false,//验证码错误
            add:false,//无添加操作
            update:false,//无更新操作
            remove:true//删除成功
          }
        }else{
          return{
            inTime:false,//超时
            code:false,//验证码错误
            add:false,//无添加操作
            update:false,//无更新操作
            remove:false//删除失败
          }
        }
      })
    }
  })

}