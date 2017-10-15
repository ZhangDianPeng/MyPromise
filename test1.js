/**
 * Created by zhangdianpeng on 2017/9/27.
 */

let MyPromise = require('./promise1');

let generatePromise = function(value, time){
    return new MyPromise(function(resolve, reject){
        setTimeout(function(){
            resolve(value);
        }, time);
    })
};

let promises = [];

let times = [2000, 3000, 1000];

for(let time of times){
    promises.push(generatePromise(time, time));
}

let reduceFun = function(initData, data){
    console.log(initData +  ' + ' + data +  ' = ' + (initData + data));
    return initData + data;
};

MyPromise.reduce(promises, reduceFun, 200).then(res => console.log('reduce.result:', res));

MyPromise.all(promises).then(res => res.reduce(reduceFun, 200)).then(res => console.log('reduce.result:', res));

