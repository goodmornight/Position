// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const db = cloud.database();
  const _ = db.command;
  const user_1 = db.collection('user-1');
  const user = await cloud.callFunction({
    name: 'getAllUsers'
  }).then(res => {
    return res.result.data;
  });
  for(let i=0;i<user.length;i++){
    await user_1.where({
      _openid: user[i]._openid
    }).update({
      data: {
        isPushed:false
      }
    })
  }
}