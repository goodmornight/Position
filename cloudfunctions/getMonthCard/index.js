// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const log = cloud.logger();
  const db = cloud.database({
    env: cloud.DYNAMIC_CURRENT_ENV
  });
  console.log(cloud.DYNAMIC_CURRENT_ENV)
  const _ = db.command;
  const report = db.collection('report');
  const openid = wxContext.OPENID;
  const year = event.year;
  console.log(year)
  // const month = event.month; //这比正常月份少1
  // let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
  // let dayNums = new Date(year, nextMonth, 0).getDate(); //获取目标月有多少天
  // let start = new Date(year, month, 1, 7, 0, 0).getTime(); //当月第一天7点
  // let end = new Date(year, month, dayNums, 22, 0, 0).getTime(); //当月最后一天晚上22点

  let result = [[],[],[],[],[],[],[],[],[],[],[],[]];
  return await report.where({
        _openid: openid
      }).get().then(res => {
        let data = res.data;
        data.forEach(item => {
          let obj = str2date(item.createTime_num);
          if(obj.year==year){
            result[obj.month].push(obj);
          }
          // if (result.detail.get(obj.year)==null){
          //   result.detail.set(obj.year,new Map());
          // }
          // result.detail.get(obj.year).set(obj.month,obj);
          
        })
        return result;
      })
      // let data = res.data;
      // if (data.length == 0) {
      //   return {
      //     total: 0,
      //     result: []
      //   }
      // } else {
      //   let result = new Array();
      //   data.forEach(item => {
      //     result.push(str2date(item.createTime_num));
      //   });
      //   return {
      //     total: data.length, //月打卡天数
      //     result: result //这个月分别有哪些天打卡
      //   }
      // }

  //查找一共的打卡天数
  // report.where({
  //   _openid: openid
  // }).count({
  //   success(res) {
  //     console.log(res);
  //     total_all = res.total;
  //   },
  //   fail(res) {
  //     console.log(res);
  //   }
  // })
  //查找当月的打卡天数
  // report.where({
  //   _openid:openid,
  //   createTime_num:_.in([start,end])
  // }).get({
  //   success(res){
  //     let data = res.data;
  //     total_month = data.length;
  //     if(total_month==0){
  //       return {
  //         total_all:total_all,
  //         total_month:total_month,
  //         result:[]
  //       }
  //     }else{
  //       let result = new Array();
  //       data.forEach(item=>{
  //         result = str2date(item.createTime_num)
  //       });
  //       return {
  //         total_all: total_all,
  //         total_month: total_month,
  //         result:result
  //       }
  //     }
  //   },
  //   fail(res){
  //     console.log(res);
  //     return {
  //       total_all: total_all,
  //       total_month: total_month,
  //       result: []
  //     }
  //   }
  // })
}

function str2date(sec) {
  let day = new Date(sec+8*60*60*1000);
  let year = day.getFullYear();
  let month = day.getMonth();
  let date = day.getDate();
  return {
    createTime: sec,
    year:year,
    month:month,
    date: date
  }
}
