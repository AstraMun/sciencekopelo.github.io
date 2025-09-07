self.addEventListener('install', e=>{
  e.waitUntil(caches.open('duoscience-v1').then(c=>c.addAll([
    './','./index.html','./style.css','./app.js','./data.js','./manifest.json'
  ])));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(res=> res || fetch(e.request)));
});