// Cache map tiles and site images so the story map loads instantly on repeat visits.
const TILE_CACHE='bk-tiles-v1', SITE_CACHE='bk-site-v2';
const TILE_HOSTS=['service.pdok.nl','tiles.arcgis.com'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(SITE_CACHE).then(c=>c.addAll(['./','index.html','architects.html']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==TILE_CACHE&&k!==SITE_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  if(TILE_HOSTS.includes(u.hostname)||u.pathname.includes('/assets/')){
    e.respondWith(caches.open(u.hostname===location.hostname?SITE_CACHE:TILE_CACHE).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;
      try{const r=await fetch(e.request);if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}catch(err){return hit||Response.error()}}));return}
  if(u.hostname===location.hostname&&(u.pathname.endsWith('/')||u.pathname.endsWith('.html'))){
    e.respondWith(fetch(e.request).then(r=>{const cl=r.clone();caches.open(SITE_CACHE).then(c=>c.put(e.request,cl));return r}).catch(()=>caches.match(e.request)))}
});
