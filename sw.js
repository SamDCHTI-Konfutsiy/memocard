// MemoCards Service Worker — KILL SWITCH
// Bu versiya ataylab hech narsani keshlamaydi va o'zini o'chiradi.
// Maqsad: avvalroq o'rnatilgan eski Service Worker'ni barcha foydalanuvchilarda
// tozalab, ularni har doim server'dagi eng yangi kodga yo'naltirish.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Eski barcha keshlarni o'chirish
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // O'zini butunlay o'chirish — shundan keyin brauzer bu saytni
      // Service Worker'siz, to'g'ridan-to'g'ri server'dan yuklaydi
      await self.registration.unregister();

      // Ochiq turgan barcha tablarni majburan qayta yuklash,
      // shunda ular darhol yangi kodni oladi
      const allClients = await clients.matchAll({ type: 'window' });
      allClients.forEach((client) => client.navigate(client.url));
    })()
  );
});

// Hech qanday fetch'ni ushlamaymiz — har doim to'g'ridan-to'g'ri network'ga o'tkazamiz
self.addEventListener('fetch', (event) => {
  // intentionally not intercepting — pass-through to network
});
