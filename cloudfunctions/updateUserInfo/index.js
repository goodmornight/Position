// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  const classA = event.classA;
  const classB = event.classB;
  const classC = event.classC;
  const name = event.name;
  const number = event.number;
  const db = cloud.database();
  const user_1 = db.collection('user-1');
  return await user_1.where({
    _openid:openid
  }).update({
    data:{
      classA: classA,
      classB: classB,
      classC: classC,
      name: name,
      number: number
    }
  }).then((res)=>{
    return res;
  })
}