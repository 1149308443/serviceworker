
//sw文件只会在注册sw或者更新sw是才执行
console.log('work12');


//缓存列表
var urlsToCache = [
  './app.js',
  './1.png',
  './index.html',
  './style.css'
];

//定义缓存名称
var CACHE_NAME = 'counterxing-v4';


// 安装
self.addEventListener('install',(event) => {
  console.log('install事件')
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// 激活
self.addEventListener('activate', (event) => {
  console.log('activate事件');
  var cacheWhitelist = [CACHE_NAME];
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) =>{
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  console.log('fetch事件')
  //有缓存则返回缓存，无缓存则去服务器
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
    }
    )
  );
});


// service worker 和主进程通讯
// self.addEventListener('message', (event)=>{
//   console.log('页面传递过来的数据',event.data)  // 收到主线程传递的信息
//   event.source.postMessage('this message is from sw.js to page');  // 向主线程传递信息
// })

