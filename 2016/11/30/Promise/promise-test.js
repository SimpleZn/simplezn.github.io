
// promise test

//---- create ---- 

var promise = new Promise(function(resolve, reject) {

  console.log('new promise.');

  setTimeout(function() {
    resolve(Math.random())
  }, 2000);

});

promise.then(function(value) {
  console.log(value);
}, function(error) {
  console.log(error);
});

// 还可以再继续添加回调，这时会立即得到结果，这是和事件不一样的地方

promise.then(function(value) {
  console.log(value);
});

//---- resolve reject ----

// Promise构造函数接受一个函数作为参数，该函数的两个参数分别是resolve 和 reject。
// 它们是两个函数，由js引擎提供，不用自己部署。
// resolve函数的作用，是将Promise对象的状态从‘未完成’ 变为‘成功’，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去
// reject函数的作用与resolve相反，将Promise对象的状态从‘未完成’变为‘失败’， 在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

// 如果调用resolve函数和reject函数时带有参数，那么它们的参数会被传递给回调函数。reject函数的参数通常是Error对象的实例，表示抛出的错误；
// resolve函数的参数除了正常的值以外，还可能是另一个Promise实例，表示异步操作的结果可能是一个值，也有可能是另一个异步操作。

var promise2 = new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve(promise); // 传递一个promise实例
  }, 1000);
});

promise2.then(function(value) {
  console.log(value);
});

// 这是promise的状态会传递给promise2, promise的状态决定了promise2的状态。


//---- then ----

// then的作用是为promise实例添加状态改变时的回调函数
// 第一个参数是Resolved状态的回调函数，第二个参数（可选）是Rejected状态的回调函数
// 返回promise的一个新的实例，因此可以采用链式写法。（后一个promise实例会依赖上一个promise实例的状态，如果上一个promise实例状态是Rejected,则后面的promise实例状态也是Rejected）
// 采用链式调用的then可以指定一组按照次序调用的回调函数，如果前一个回调函数返回的是一个promise对象（有异步操作），
// 这时后一个回调函数会等待该promise对象状态发生变化时，才会进行调用。

function getData() {
  return new Promise(function(resolve, reject) {
    var obj = {
      num: 0
    };
    setTimeout(function() {
      obj.num = Math.random();
      resolve(obj);
    }, 1000);
  });
}

// no return
getData().then(function(obj) {
  console.log(obj.num);
}).then(function(value) {
  console.log(value); // undefined
});

// return normal value
getData().then(function(obj) {
  console.log(obj.num);
  return obj.num;
}).then(function(value) {
  console.log(value); // obj.num
});

// return another promise
getData().then(function(obj) {
  console.log(obj.num);
  return getData();
}).then(function(value) {
  console.log(value); // new obj
});


//---- catch ----

// catch方式是.then(null, reject)的别名，用于指定错误时的回调函数

var p = new Promise(function(resolve, reject) {
  throw new Error('test');
  // 或者: reject(new Error);
  // 或者: try { throw new Error('test') } catch(e) { reject(e) }
});

p.catch(function(error) {
  console.log(error);
});

// reject 方法的调用，等同于抛出错误。

// Promise对象的错误具有冒泡性质，会一直向后传递，直到捕获为止。也就是说，错误总是会被下一个catch语句捕获

p.then(function(val) {
  // ...
}).then(function(val) {
  // ...
}).catch(function(e) {
  // 处理前面三个promise产生的错误
  console.log(e);
});

// 一般来说，不要在then方法里面定义Reject状态的回调函数，总是使用catch捕获错误



//---- Promise.all ----

// Promise.all方法用于将多个Promise实例，包装成一个新的Promise实例。

var p = Promise.all([p1, p2, p3]);

// Promise.all方法接受一个promise实例数组作为参数（可以不是数组，但需要具有iterator接口），
// 如果元素不是Promise实例，就会先调用Promise.resolve方法，将参数转为Promise实例，再进一步处理。

// p的状态由p1，p2，p3决定，分为两种情况。

// (1) 只有p1，p2，p3的状态都变成Resolved， p的状态才会变成fulfilled，此时p1，p2，p3的返回值组成一个数组，传递给p的回调函数。
// (2) 只要p1，p2，p3之中有一个被rejected， p的状态就变成rejected,此时第一个被reject的实例的返回值，会传递给p的回调函数。

var promises = [1,2,3,4].map(function(id) {
  return getData(id);
});

Promise.all(promises).then(function(valArr) {
  // ...
}).catch(function(error) {
  // ...
});

//---- Promise.race ----

// Promise.race方法同样是将多个Promise实例，包装成一个新的Promise实例
var p = Promise.race([p1,p2,p3]);

// 上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的Promise实例的返回值，就传递给p的回调函数。

var p = Promise.race([
  getData(),
  new Promise(function(resolve, reject) {
    setTimeout( () => reject(new Error('request timeout')), 5000)
  })
]);
p.then(response => console.log(response))
 .catch(error => console.log(error));



//---- Promise.resolve() ----

// 有时需要将现有对象转为Promise对象，Promise.resolve方法就起到这个作用

//---- Promise.reject() ----

// Promise.reject(reason)方法也会返回一个新的Promise实例，该实例的状态为rejected。它的参数用法与Promise.resolve方法完全一致。


//---- done ----
// Promise对象的回调链，不管以then方法或catch方法结尾，要是最后一个方法抛出错误，都有可能无法捕捉到（因为Promise内部的错误不会冒泡到全局）。
// 因此，我们可以提供一个done方法，总是处于回调链的尾端，保证抛出任何可能出现的错误。


//---- finally ----
// finally方法用于指定不管Promise对象最后状态如何，都会执行的操作。
// 它与done方法的最大区别，它接受一个普通的回调函数作为参数，该函数不管怎样都必须执行。