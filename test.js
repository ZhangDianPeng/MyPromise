/**
 * Created by zhangdianpeng on 2017/9/26.
 */
let MyPromise = require('./promise');
let generatePromise = function(value, message){
    return new MyPromise(function(resolve, reject){
        setTimeout(function(){
            if(message){
                reject(message);
            }else{
                resolve(value);
            }
        }, 1000);
    })
};

generatePromise('step1').then(res => {
    console.log('step1:', res);
    return 'step2';
}).then(res => {
    console.log('step2.res:', res);
    return generatePromise('step2', 'step2 is erring!');
}, err => {
    console.log('step2.err:', err);
    return err.message;
}).then(res => {
    console.log('step3.res', res);
    return res + '第四次';
});