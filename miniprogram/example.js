// let weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
// let completed = [0,1,0,1,0,0,1]
// let today = new Date();
// let year = today.getFullYear();
// let month = today.getMonth();
// let day = today.getDate();
// let weekday = today.getDay();
// console.log(today.getTime())
// let firstday = new Date();
// console.log(firstday)
// firstday = firstday.setTime(today.getTime() - 24 * 60 * 60 * 1000 * weekday);
// console.log(firstday.getTime())
// var data = getWeekList(firstday, today, weekList, completed);
// function getWeekList(firstday,today,weekList,completed){
//   console.log(firstday)
//   let list = [];
//   for(let i =0;i<7;i++){
//     firstday.setTime(firstday.getTime()-24*60*60*1000*i);
//     let temp = {
//       date:'',
//       weekday:weekList[i],
//       completed:'',
//       code:completed[i]
//     }
//     temp.date = getFullTime(firstday);
//     if(date.getTime()>today.getTime()){
//       temp.completed = "未完成";
//     }else{
//       if(completed[i]==0){
//         temp.completed = "失败";
//       }else{
//         temp.completed = "详情";
//       }
//     } 
//     list.push(temp);
//   }
//   return list;
// }
// function getFullTime(date) {
//   let y = date.getFullYear();
//   let m = date.getMonth();
//   let d = date.getDate();
//   return overTimeStr(y)+'.'+overTimeStr(m)+'.'+overTimeStr(d);
// }

// function overTimeStr(num) {
//   if (num < 10) {
//     return '0' + num;
//   } else {
//     return '' + num;
//   }
// }
let data = [{
  id: 1,
  date: '2020.02.17',
  weekday: '星期一',
  completed: true
}, {
  id: 2,
  date: '2020.02.18',
  weekday: '星期二',
  completed: true
}, {
  id: 3,
  date: '2020.02.19',
  weekday: '星期三',
  completed: true
}, {
  id: 4,
  date: '2020.02.20',
  weekday: '星期四',
  completed: true
}, {
  id: 5,
  date: '2020.02.21',
  weekday: '星期五',
  completed: true
}, {
  id: 6,
  date: '2020.02.22',
  weekday: '星期六',
  completed: true
}, {
  id: 7,
  date: '2020.02.23',
  weekday: '星期日',
  completed: false
}];
// let index_imgs = [""]
module.exports = {
  card_detail: data.reverse()
}