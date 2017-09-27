/**
 * Created by zhangdianpeng on 2017/9/27.
 */

let MyPromise = require('./promise1');

let generatePromise = function(value, message){
    let time = Math.random() * 10;
    console.log('time:', time);
    return new MyPromise(function(resolve, reject){
        setTimeout(function(){
            if(message){
                reject(message);
            }else{
                resolve(value);
            }
        }, time);
    })
};

let promises = [];

for(let i = 0; i < 10; i++){
    promises.push(generatePromise(i));
}

MyPromise.all(promises).then(res => console.log('res:', res));