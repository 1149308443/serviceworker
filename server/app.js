if (navigator.serviceWorker) {
  window.addEventListener('load', () => {
    console.log('开始注册ServiceWorker')

    // 注册service worker
    navigator.serviceWorker.register('./servicework.js')
      .then((reg) => {
        // if(reg.installing) {
        //     console.log('Service worker installing');
        //   } else if(reg.waiting) {
        //     console.log('Service worker installed');
        //   } else if(reg.active) {
        //     console.log('Service worker active');
        //   }
        console.log('ServiceWorker register success: ', reg)

        // 传递
        // navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage("this message is from page");
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });


      // 卸载 service worker
      // navigator.serviceWorker.getRegistrations().then(function (registrations) {
      //   for (let registration of registrations) {
      //     //安装在网页的service worker不止一个，找到我们的那个并删除
      //     console.log(registration)
      //     if (registration && registration.scope === 'http://localhost:8080/') {
      //       registration.unregister()
      //     }
      //   }
      // })
      // 接收
      // navigator.serviceWorker.addEventListener('message', function (e) {
      //   console.log('service worker传递的信息',e.data); 
      // });
  });
}