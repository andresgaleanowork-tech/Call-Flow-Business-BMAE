/* Call Flow Business · service worker (v1.5.1)
   Documentos (HTML): network-first → siempre la versión nueva cuando hay red,
   con caché como respaldo offline. Resto (assets): caché con actualización en
   segundo plano. */
const CACHE = 'cfb-v231';
const ARCHIVOS = ['./','index.html','admin.html','pymes.html','residencial.html','tutorial.html',
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
  const esDoc = e.request.mode==='navigate' || e.request.destination==='document';
  if(esDoc){
    e.respondWith(
      fetch(e.request).then(r=>{
        if(r&&r.ok){ const copia=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copia)); }
        return r;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
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
