# workbox

workbox是是 Google推出的一套 Web App 静态资源本地存储的解决方案， 主要是基于servicework的更上一层的封装，如果单独使用servicework来做离线应用，会有很多坑，而且考虑的也不够全面。而workbox则很好的屏蔽了这些坑，使用起来会方便很多

#### 预缓存

 预缓存适用与发布上线后就不会改变的静态资源，html，css，js，图片。通过workbox.precaching对象，可以使用常用的预缓存功能，其中最常用的方法是 workbox.precaching.precacheAndRoute(list,option),

```javascript
workbox.precaching.precacheAndRoute(
    [
     './common/js/react.js',
     './common/js/react-dom.js',
      {url:'./index.html',revision:'asw32'},
      'index.23323kd.js'
    ],
    {
 	 ignoreUrlParametersMatching:[/app/]
	}
)
```

workbox.precaching.precacheAndRoute方法会在servicework 的 install 事件的时候去缓存list资源,第二参数为可选，里面是对预缓存的配置，ignoreUrlParametersMatching表示需要忽略的query参数，如果配置了ignoreUrlParametersMatching:[/app/]，则当url为http://localhost/index.html和http://localhost/index.html？app=3时都可以命中这个预缓存。这个配置比较有用，因为常常在打开页面时都会带一些参数，而且这些参数是变化的，这样就会导致不易命中缓存，所以经常需要忽略掉。

对于预缓存的资源列表，一般会给一个类实哈希的值，这样在servicework跟新的时候回根据这个值判断，是否需要重新去下载改预缓存文件。这种哈希一般会有两种情况，一是'index.23323kd.js'这种，这种一般是改变了文件名，servicework发现文件名变了，在更新的时候就会重新去拿取index.js文件的缓存，并且还会很智能的将之前的index.js删除。第二种就是通过{url:'./index.html',revision:'asw32'}一个revision来判断的，这个revision可以理解为是根据index.html文件内容生成的一个签名，只要文件内容不变，则这个revision就不会改变，只要这个值一改变就说明内容改变了，当servicework更新时就会去重新预缓存这个文件。相关revision相关的凭据是存在indexDB中的。

因为这个哈希的存在，如果靠我们手动去维护一份预缓存清单是很困难的，不可能改了一个文件去修改对应的revision，也不可能每次打包完后去修改文件的md5值。所以需要通过工具去自动生成一份预缓存文件的清单。一般通过 workbox 命令行 	 workbox-build npm 包   workbox-webpack-plugin 这三种方法都可以做到。说一下workbox-webpack-plugin，这个插件下有两个方法InjectManifest，和GenerateSW，前者可以根据一个servicework.js文件生成一个新的servicework文件，后者则可以直接生成一个servicework.js文件，为了更好的自己控制缓存，一般选用第一种情况。这个方法可以帮我生成带有预缓存的servicework.js文件，并且每个预缓存的文件都会有一个revision。

#### 路由请求（动态缓存）

workbox的动态缓存是通过这个接口实现的 workbox.routing.registerRoute(match,hander),match表示匹配规则，hander表示匹配成功后理方式。这个方法实际上是在servicework的fetch事件去监听被匹配的路由。

##### 路由匹配规则：

 + 字符串形式  对资源 URL 进行字符串匹配。URL 字符串可以是完整 URL 或者是相对路径，如果是相对路径，Workbox 首先会以当前网页的 URL 为基准进行补全再进行字符串匹配 

   ```javascript
   workbox.routing.registerRoute('http://127.0.0.1:8080/index.css', handlerCb)
   workbox.routing.registerRoute('/index.css', handlerCb)
   ```

+ 对资源 URL 进行正则匹配  如下表示以.css文件结尾都可以命中这个缓存  但是对于**跨域资源**来说不能用正则的方式进行匹配。 

  ```javascript
  workbox.routing.registerRoute(/\.css$/, handlerCb)
  ```

+ 自定义路由匹配方法。match 允许传入一个自定义方法来实现较为复杂的资源请求匹配规则，这个自定义方法可以仿造下面的代码实现。 自定义路由匹配方法要求是个同步执行函数 ，并且返回值是一个布尔值，表示能否命中缓存

  ```javascript
  const match = ({url, event}) => {
    return url.pathname === '/index.html'
  }
  ```

##### 缓存策略：

对于hander来说，workbox提供了5中缓存策略：

+  **StaleWhileRevalidate**    这种策略的意思是当请求的路由有对应的 Cache 缓存结果就直接返回，在返回 Cache 缓存结果的同时会在后台发起网络请求拿到请求结果并更新 Cache 缓存，如果本来就没有 Cache 缓存的话，直接就发起网络请求并返回结果 **（ 从缓存中读取资源的同时发送网络请求更新本地缓存 ）**
+  **NetworkFirst**  这种策略就是当请求路由是被匹配的，就采用网络优先的策略，也就是优先尝试拿到网络请求的返回结果，如果拿到网络请求的结果，就将结果返回给客户端并且写入 Cache 缓存，如果网络请求失败，那最后被缓存的 Cache 缓存结果就会被返回到客户端，这种策略一般适用于返回结果不太固定或对实时性有要求的请求，为网络请求失败进行兜底。 （**有网的情况下采取网络，没网的情况下用缓存）**
+  **CacheFirst**   这个策略的意思就是当匹配到请求之后直接从 Cache 缓存中取得结果，如果 Cache 缓存中没有结果，那就会发起网络请求，拿到网络请求结果并将结果更新至 Cache 缓存，并将结果返回给客户端。这种策略比较适合结果不怎么变动且对实时性要求不高的请求。 **（有缓存用缓存，无缓存则请求网络）**
+  **NetworkOnly**  比较直接的策略，直接强制使用正常的网络请求，并将结果返回给客户端，这种策略比较适合对实时性要求非常高的请求。 **（仅使用网络请求）**
+  **CacheOnly**  这个策略也比较直接，直接使用 Cache 缓存的结果，并将结果返回给客户端，这种策略比较适合一上线就不会变的静态资源请求。 **（仅使用缓存）**

##### 自定义缓存策略

也可以根据自己的需求自定义缓存策略。

```javascript
const handlerCb = ({url, event, params}) => {
  return Promise.resolve(new Response('Hello World!'))
}
```

其中，传入资源请求处理方法的对象包含以下属性：

- url：event.request.url 经 URL 类实例化的对象；
- event：fetch 事件回调参数；
- params：自定义路由匹配方法所返回的值。

对资源请求处理方法的要求是，函数必须是个异步方法并返回一个 Promise，且这个 Promise 解析的结果必须是一个 Response 对象。

#####  缓存策略配置

Workbox 缓存策略均可进行如下配置：

- cacheName：指定当前策略进行资源缓存的名称；(不指定默认运行时缓存的名称)
- plugins：指定当前策略所使用的插件列表；

对于需要使用 Fetch API 来发送网络请求的策略将会多出以下配置项：

- fetchOptions： Fetch API 的第二个参数，传给当前策略中所有使用到的 Fetch API；

对于需要使用 Cache API 操作本地缓存的策略将多出以下配置项：

- matchOptions：cache.match()方法的第二个参数，传给当前策略中所有使用到 cache.match 的地方。

```javascript
workbox.routing.registerRoute(
  /\.(jpe?g|png)/,
  new workbox.strategies.CacheFirst({
    cacheName: 'image-runtime-cache',
    plugins: [
        new workbox.expiration.Plugin({
            // 对图片资源缓存 1 星期
            maxAgeSeconds: 7 * 24 * 60 * 60,
        })
    ],
    fetchOptions: {
      mode: 'cors', 对于跨域资源请求需要在设置mode为cors，还可以设置是否可以带cookie等
    },
   matchOptions: {
      ignoreSearch: true   //表示匹配时忽略掉url后面的参数
    }
  })
)
```



#####  cacheableResponse 插件

对于这三种StaleWhileRevalidate，NetworkFirst，CacheFirst缓存策略来说，他们会更新缓存，一般来说，是接口请求成功了才会更新缓存，但是这只能确保接口的code是200，接口返回的数据是否可以缓存，是否可用，还需后台通知来确定，否则很有可能因为缓存的数据不可用而导致出错，解决办法一般可以后后台共同商定，比如后端设置一个header来告诉前端这个缓存是否需要更新,cacheableResponse 这个插件可以做到

```javascript
workbox.routing.registerRoute(
  /\.(jpe?g|png)/,
  new workbox.strategies.CacheFirst({
    plugins: [
        new workbox.CacheableResponsePlugin.Plugin({ 
            //表示当状态码在200-400之间并且header中X-Is-Cacheable为true时才更新缓存。
          statuses: [200, 400],
          headers: {
            'X-Is-Cacheable': 'true',
          },
        })
    ]
  })
)
```

#### 注意

+ 不能监听处理post请求，因为servicework认为post请求是在提交数据
+ 对于预缓存的资源请求不能监听处理







#### 注意

+ Service worker 的生命周期与页面的生命周期是完全独立的。 
+ service worker文件的地址是要相对于 origin , 而不是 app 的根目录。 
+ 单个 service worker 可以控制很多页面。每个你的 scope 里的页面加载完的时候，安装在页面的 service worker 可以控制它。要注意service worker 脚本里的全局变量，每个页面不会有自己独有的worker。 
+ service worker 只能抓取在 service worker scope 里从客户端发出的请求。
+ caches只能缓存 GET & HEAD 的请求，对于 POST 等类型请求，返回数据可以保存在 indexDB 中

