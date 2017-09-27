module.exports = function MyPromise(fn) {
    let state = 'pending',
        value = null,
        callbacks = [];
    this.then = function (onFulfilled, onRejected) {
        return new MyPromise(function (resolve, reject) {
            handle({
                onFulfilled: onFulfilled,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            });
        });
    };

    this.catch = function (onRejected) {
        return new MyPromise(function (resolve, reject) {
            handle({
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            });
        });
    };

    this.all = function(promises){
        for(let p of promises){
            
        }
    };

    function handle(callback) {
        if (state === 'pending') {
            callbacks.push(callback);
            return;
        }
        let cb = state === 'fulfilled' ? callback.onFulfilled : callback.onRejected,
            ret;
        if (!cb) {
            cb = state === 'fulfilled' ? callback.resolve : callback.reject;
            cb(value);
            return;
        }
        try{
            ret = cb(value);
            callback.resolve(ret);
        }catch(err){
            callback.reject(err);
        }
    }
    function resolve(newValue) {
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            let then = newValue.then;
            if (typeof then === 'function') {
                then.call(newValue, resolve, reject);
                return;
            }
        }
        state = 'fulfilled';
        value = newValue;
        execute();
    }
    function reject(reason) {
        state = 'rejected';
        value = reason;
        execute();
    }
    function execute() {
        setTimeout(function () {
            callbacks.forEach(function (callback) {
                handle(callback);
            });
        }, 0);
    }
    fn(resolve, reject);
};