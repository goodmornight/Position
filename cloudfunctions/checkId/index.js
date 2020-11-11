// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const user = db.collection('user');
  user.where({
    name:event.name,
    number:event.idNum
  })
  .get({
    success:function(res){
      console.log(res.data);
      return true;
    },
    fail:function(res){
      console.log(res.data);
      // return res;
    }
  })
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}