/* Scalefy — Service Worker (PWA + Web Push) */
var SW_VERSION = 'scalefy-sw-2';

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

/* fetch pass-through (necessário p/ o app ser instalável) */
self.addEventListener('fetch', function(e){ /* rede normal */ });

/* PUSH: venda chegando (Fase 2 — enviado pelo Worker) */
self.addEventListener('push', function(event){
  var data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch(e){ data = { body: event.data ? event.data.text() : '' }; }
  var title = data.title || '💰 Nova venda!';
  var opts = {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [120, 60, 120, 60, 200],
    tag: data.tag || ('sale-' + Date.now()),
    renotify: true,
    data: data
  };
  /* mostra a notificação E avisa o app aberto (foreground) p/ tocar o som escolhido (cash.mp3/custom). */
  event.waitUntil(Promise.all([
    self.registration.showNotification(title, opts),
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(list){
      list.forEach(function(c){ try { c.postMessage({ type:'sale-sound', data: data }); } catch(e){} });
    })
  ]));
});

/* Clicar na notificação abre/foca o dash */
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list){
      for (var i=0;i<list.length;i++){ if ('focus' in list[i]) return list[i].focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('.');
    })
  );
});
