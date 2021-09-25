if (navigator.serviceWorker) {
  window.addEventListener('load', () => {
    console.log('开始注册ServiceWorker')
      navigator.serviceWorker.register('./servicework.js')
          .then((reg) => {
            // if(reg.installing) {
            //     console.log('Service worker installing');
            //   } else if(reg.waiting) {
            //     console.log('Service worker installed');
            //   } else if(reg.active) {
            //     console.log('Service worker active');
            //   }
          })
          .catch((err) => {
              console.log('ServiceWorker registration failed: ', err);
          });
  });
}