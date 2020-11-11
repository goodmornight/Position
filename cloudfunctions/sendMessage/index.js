// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  const user_1 = db.collection('user-1');

  const text = ['疫卡通伴你三春道边，一卡通待你四季校园','疫卡通愿为你守护，走向遇见一卡通的路','诶，同学，带好你的疫卡通！','今天，你疫卡通了么？'];
  const idx = new Date().getTime()%text.length;
  const data = {
    thing1: {
      value: '今日份打卡'
    },
    thing3: {
      value: text[idx]
    }
  };
  const user = await cloud.callFunction({
    name: 'getAllUsers'
  }).then(res => {
    return res.result.data;
  });
  const tasks = [];
  for(let i=0;i<user.length;i++){
    if(!user[i].isPushed&&user[i].pushTimes>0){
      const send = await cloud.openapi.subscribeMessage.send({
        touser: user[i]._openid,
        page: 'pages/index/index',
        lang: 'zh_CN',
        data: data,
        templateId: 'pw3_2EzrLjX5ezhxQaRYVYolzscsCMJ5SdGyQ4Ie5Ho',
        miniprogramState: 'formal'//正式版
        // miniprogramState: 'trial'//体验版
        // miniprogramState: 'developer' //开发版后期别忘了把这块修改
      }).then(async(res)=>{
        await user_1.where({
          _openid: user[i]._openid
        }).update({
          data: {
            pushTimes: _.inc(-1)
          }
        })
      })
      tasks.push(send)
    }
    
  }
  await Promise.all(tasks).then((res)=>{
    console.log(res)
  })
}