/**
 * Created by zhangdianpeng on 2017/9/27.
 */

//完整的Promise实现：then函数，catch函数，resolve函数，reject函数，all函数，race函数


try {
    module.exports = MyPromise
} catch (e) {}

function MyPromise(executor) {
    let self = this;

    self.status = 'pending';
    //这里是数组的原因是因为同一个Promise可以有多次then函数调用
    self.onResolvedCallback = [];
    self.onRejectedCallback = [];

    function resolve(value) {
        if (value instanceof MyPromise) {
            return value.then(resolve, reject);
        }
        //这里延迟执行，是因为有些then和catch函数可能还没有被注册
        setTimeout(function() {
            //resolve和reject函数两个只有其中一个会被执行，而且只执行一次
            if (self.status === 'pending') {
                self.status = 'resolved';
                self.data = value;
                for (let i = 0; i < self.onResolvedCallback.length; i++) {
                    self.onResolvedCallback[i](value);
                }
            }
        })
    }

    function reject(reason) {
        setTimeout(function() {
            //resolve和reject函数两个只有其中一个会被执行，而且只执行一次
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.data = reason;
                //如果Promise没有被捕获，那么会将该异常打印到控制台
                if (self.onRejectedCallback.length === 0) {
                    console.error('unhandledPromise:', reason)
                }
                for (let i = 0; i < self.onRejectedCallback.length; i++) {
                    self.onRejectedCallback[i](reason);
                }
            }
        })
    }

    try {
        executor(resolve, reject)
    } catch (reason) {
        reject(reason)
    }
}

//x是promise.then函数resolve返回的值，返回一个新的Promise(resolve, reject);
function resolvePromise(promise2, x, resolve, reject) {
    let then;
    let thenCalledOrThrow = false;

    //发生死循环
    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise!'))
    }

    //返回的类型本身就是Promise
    if (x instanceof MyPromise) {
        if (x.status === 'pending') {
            x.then(function(v) {
                resolvePromise(promise2, v, resolve, reject)
            }, reject);
        } else {
            x.then(resolve, reject)
        }
        return ;
    }

    //这里是为了兼容其它类型的Promise
    if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            then = x.then;
            if (typeof then === 'function') {
                then.call(x, function rs(y) {
                    if (thenCalledOrThrow) return;
                    thenCalledOrThrow = true;
                    return resolvePromise(promise2, y, resolve, reject);
                }, function rj(r) {
                    if (thenCalledOrThrow) return;
                    thenCalledOrThrow = true;
                    return reject(r);
                });
            } else {
                resolve(x)
            }
        } catch (e) {
            if (thenCalledOrThrow) return;
            thenCalledOrThrow = true;
            return reject(e)
        }
    } else {
        resolve(x)
    }
}

MyPromise.prototype.then = function(onResolved, onRejected) {
    let self = this;
    let promise2;
    //实现值穿透
    onResolved = typeof onResolved === 'function' ? onResolved : function(v) {
        return v
    };
    onRejected = typeof onRejected === 'function' ? onRejected : function(r) {
        throw r
    };

    if (self.status === 'resolved') {
        return promise2 = new MyPromise(function(resolve, reject) {
            setTimeout(function() { // 异步执行onResolved
                try {
                    let x = onResolved(self.data);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (reason) {
                    reject(reason)
                }
            })
        })
    }

    if (self.status === 'rejected') {
        return promise2 = new MyPromise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    let x = onRejected(self.data);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (reason) {
                    reject(reason)
                }
            })
        })
    }

    if (self.status === 'pending') {
        // 这里之所以没有异步执行，是因为这些函数必然会被resolve或reject调用，而resolve或reject函数里的内容已是异步执行，构造函数里的定义
        return promise2 = new MyPromise(function(resolve, reject) {
            self.onResolvedCallback.push(function(value) {
                try {
                    let x = onResolved(value);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (r) {
                    reject(r)
                }
            });

            self.onRejectedCallback.push(function(reason) {
                try {
                    let x = onRejected(reason);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (r) {
                    reject(r)
                }
            })
        })
    }
};

MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected)
};

MyPromise.resolve = function(value){
    return new MyPromise(function(resolve){
        resolve(value);
    });
};

MyPromise.reject = function(value){
    return new MyPromise(function(resolve, reject){
        reject(value);
    });
};

MyPromise.all = function(promises){
    return new MyPromise(function(resolve, reject){
        if(!promises || !promises.length){
            return resolve([]);
        }
        let promiseResult = [];
        for(let p of promises){
            MyPromise.resolve(p).then(result => {
                promiseResult.push(result);
                if(promiseResult.length == promises.length){
                    resolve(promiseResult);
                }
            }, error => {
                reject(error);
            })
        }
    });
};

MyPromise.race = function(promises){
    return new MyPromise(function(resolve, reject){
        if(!promises || !promises.length){
            return resolve(undefined);
        }
        for(let p of promises){
            MyPromise.resolve(p).then(resolve, reject);
        }
    });
};