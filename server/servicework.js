
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

self.addEventListener('fetch', (event) => {
  // console.log('fetch事件')

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

  //缓存优先，同事更新缓存资源
  event.responWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        })
        return response || fetchPromise;
      })
    })
  )
});


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
