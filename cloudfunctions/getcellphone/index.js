// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event);
  let phoneObj = event.id;
  console.log(phoneObj);
  // let phoneNum = phoneObj.data.phoneNumber;
  let phoneNum = phoneObj.data.purePhoneNumber;
  return phoneNum;
}