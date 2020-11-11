// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'position-release-t8oyl'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  const report = db.collection('report');
  let reportYesterday = await report.where({
    _openid: event._openid
  }).orderBy('createTime_num', 'desc').get();
  console.log(reportYesterday)
}