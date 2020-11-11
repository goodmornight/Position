// 云函数入口文件
const cloud = require('wx-server-sdk');
const tencentcloud = require("tencentcloud-sdk-nodejs");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const db = cloud.database();
  const _ = db.command;
  const tempcode = db.collection('tempcode');
  const secretID='AKID6y1orgnUYLvFKfKW1EAsLZVCdoiMn0AM';
  const secretKey='72pYBalh5lGcnGevxrhT2PzThqlUwBCw';
  const smsClient = tencentcloud.sms.v20190711.Client;
const models = tencentcloud.sms.v20190711.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;
let newTime = new Date().getTime()+8*60*60*1000;//生成时间
let code = [(newTime%1000000).toString()];//验证码
let phone = event.phone;//发送手机号
console.log(event.phone)
let cred = new Credential(secretID, secretKey);
let httpProfile = new HttpProfile();

httpProfile.reqMethod = "POST";
/* SDK有默认的超时时间，非必要请不要进行调整
 * 如有需要请在代码中查阅以获取最新的默认值 */
httpProfile.reqTimeout = 30;
httpProfile.endpoint = "sms.tencentcloudapi.com";

// 实例化一个client选项，可选的，没有特殊需求可以跳过。
let clientProfile = new ClientProfile();
/* SDK默认用TC3-HMAC-SHA256进行签名，非必要请不要修改这个字段 */
clientProfile.signMethod = "HmacSHA256";
clientProfile.httpProfile = httpProfile;

let client = new smsClient(cred, "ap-guangzhou", clientProfile);

let req = new models.SendSmsRequest();
/* 短信应用ID: 短信SdkAppid在 [短信控制台] 添加应用后生成的实际SdkAppid，示例如1400006666 */
req.SmsSdkAppid = "1400332073";
/* 短信签名内容: 使用 UTF-8 编码，必须填写已审核通过的签名，签名信息可登录 [短信控制台] 查看 */
req.Sign = "疫卡通";

/* 下发手机号码，采用 e.164 标准，+[国家或地区码][手机号]
 * 示例如：+8613711112222， 其中前面有一个+号 ，86为国家码，13711112222为手机号，最多不要超过200个手机号*/
req.PhoneNumberSet =["+86"+phone];
// req.PhoneNumberSet = event.phone;
// console.log(event.phone);
/* 模板 ID: 必须填写已审核通过的模板 ID。模板ID可登录 [短信控制台] 查看 */
req.TemplateID = "552984";
/* 模板参数: 若无模板参数，则设置为空*/
req.TemplateParamSet = code;
// req.TemplateParamSet = ["123456"];
// 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数

const sendText = function () {
  return new Promise(function (resolve, reject) {
    client.SendSms(req, function (err, response) {
      // 请求异常返回，打印异常信息
      if (err) {
          console.log(err);
          reject('');
      }
      // 请求正常返回，打印response对象
      console.log(response.to_json_string());
      resolve(code[0]);
    });
  })
}
const textCode = await sendText();
if(sendText!=''){
  return await tempcode.where({
    _openid:openid
  }).get().then(async(res)=>{
    if(res.data.length==0){
      return await tempcode.add({
        data:{
          _openid:openid,
          createTime:newTime,
          phone:phone,
          code:code[0]
        }
      }).then(add_res=>{
        return add_res;
      })
    }else{
      return await tempcode.where({
        _openid:openid
      }).update({
        data:{
          createTime:newTime,
          phone:phone,
          code:code[0]
        }
      }).then(update_res=>{
        return update_res;
      })
    }
  })
}
// return await sendText();
// tasks.push(test)
// return await Promise.all(tasks).then(res=>{
//   return code[0];
// })
}