/* Call Flow Business · service worker (v1.1)
   Estrategia: caché primero con actualización en segundo plano. Todo queda
   servido offline tras la primera visita; si hay red, se refresca silenciosamente. */
const CACHE = 'cfb-v1.1';
const ARCHIVOS = ['./','index.html','pymes.html','residencial.html','tutorial.html',
  'manifest.webmanifest','diagsystem-logo.png','diagsystem-social-preview.png'];
self.addEventListener('install',e=>{ e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{ e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      const fresca = fetch(e.request).then(r=>{
        if(r&&r.ok){ const copia=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copia)); }
        return r;
      }).catch(()=>hit);
      return hit || fresca;
    })
  );
});
