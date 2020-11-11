// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
//需要传入数据
//longitude经度
//latitude纬度
// districtCode行政区域编号
// 云函数入口函数
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;
  const community = db.collection('community');
  const city = db.collection('city');
  const districtCode = event.districtCode;
  console.log(districtCode);
  let code = '';
  let cityCode = '';
  if(districtCode!=''){
    code = event.districtCode.substring(0,4);
    cityCode = parseInt(code+"00");
  }
  console.log(cityCode);
  return await community.where({
    location: _.geoNear({
      geometry: db.Geo.Point(event.longitude, event.latitude),
      maxDistance: 1000,
    })
  }).get().then(async(res) => {
    console.log(res)
    //附近1000米计算
    let result = 0;
    if(res.data.length>0){
      let data_1000 = res.data;
      let num=0;
      for(let i =0;i<data_1000.length;i++){
        num+=data_1000[i].number;
      }
      if (num > 0 && num <= 5) {
        result = 5;
      } else if (num > 5 && num <= 10) {
        result = 10;
      } else if (num > 10) {
        result = 15;
      }
    }
    return await city.where({
      code: cityCode
    }).get().then(res_code => {
      console.log(res_code)
      if(res_code.data.length>0){
        let city_num = res_code.data[0].now;
        if (city_num>0&&city_num <= 50) {
          result += 10;
        } else if (city_num > 50 && city_num <= 100) {
          result += 20;
        } else if (city_num > 100 && city_num <= 300) {
          result += 30;
        } else if (city_num > 300 && city_num <= 400) {
          result += 40;
        } else if (city_num > 400 && city_num <= 600) {
          result += 50;
        } else if (city_num > 600 && city_num <= 1000) {
          result += 60;
        } else if (city_num > 1000 && city_num <= 4000) {
          result += 70;
        } else if (city_num > 4000 && city_num <= 10000) {
          result += 80;
        } else if (city_num > 10000) {
          result += 85;
        }
        if(result<30){
          result += Math.floor(Math.random() * 3);
        }else if(result>=30){
          result += Math.floor(Math.random() * 5);
        }
      }else{
        result +=Math.floor(Math.random() * 10+20);
      }     
      return {
        result: result
      }
    })
  })
}