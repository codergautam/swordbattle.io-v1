self.addEventListener("install", (e) => {
  console.log("[SW] Hello from service worker. (pssst you should sub to coder gautam on yt)");
});

   self.addEventListener("fetch", function(event) {
   event.respondWith(async function() {
      try{
        var res = await fetch(event.request);
        var cache = await caches.open("cache");
        cache.put(event.request.url, res.clone());
        return res;
      }
      catch(error){
        return caches.match(event.request);
       }
     }());
 });


