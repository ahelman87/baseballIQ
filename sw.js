/* Baseball IQ service worker — offline app shell.

   STRATEGY — network-first navigation with a stall timeout:
   - Online, every load fetches index.html fresh (Vercel serves must-revalidate,
     so unchanged deploys are a cheap 304). A shipped bug reaches its fix on the
     next reload; freshness never depends on service-worker update timing.
   - The real dugout failure is ONE BAR, not zero: a stalled connection accepts
     and then hangs, and fetch() never rejects on a hang — so the network fetch
     races a short timer, and the cached shell wins the race. The fallback only
     applies when a cached copy exists: a slow FIRST visit stays a slow load,
     never a failed one. Whenever the network response eventually lands, it
     refreshes the cache in the background either way.
   - Only res.ok responses are cached: a transient 500 mid-deploy must never
     become the offline shell.
*/
"use strict";

const CACHE = "shell-v1";                              // bump only if SHELL changes
const SHELL = ["/", "/favicon.ico", "/apple-touch-icon.png"];
const NAV_TIMEOUT_MS = 2500;                           // stall budget before serving cache

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate") {
    /* Start the fetch immediately; whenever it lands OK — even long after the
       cache already answered this navigation — refresh the cached shell.
       Registered via waitUntil synchronously so the worker stays alive for it.
       Both "/" and "/index.html" store under "/" so either entry URL recovers. */
    const net = fetch(req);
    e.waitUntil(
      net.then(res => {
        if (!res.ok) return;                 // never cache an error page as the shell
        const copy = res.clone();            // clone NOW — one async hop later the renderer
        return caches.open(CACHE).then(c => c.put("/", copy));  // has consumed the body and
      }).catch(() => {})                     // clone() throws, silently killing the refresh
    );
    e.respondWith((async () => {
      const cached = await caches.match("/");
      if (!cached) return net;                         // first visit: nothing to fall back to
      const winner = await Promise.race([
        net.catch(() => null),                         // refused/offline → cache
        new Promise(r => setTimeout(() => r(null), NAV_TIMEOUT_MS)) // stalled → cache
      ]);
      return winner && winner.ok ? winner : cached;    // error page while cached → cache
    })());
    return;
  }

  /* Shell assets: cache-first. */
  if (SHELL.includes(url.pathname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }

  /* The analytics script is deferred, and a deferred script fetch that stalls
     holds DOMContentLoaded/load hostage for minutes on a one-bar connection.
     Race it too: after the budget, synthesize a 504 so the tag fails silently —
     the same graceful degradation it already has when fully offline. */
  if (url.pathname.startsWith("/_vercel/")) {
    e.respondWith(Promise.race([
      fetch(req).catch(() => new Response("", { status: 504 })),
      new Promise(r => setTimeout(() => r(new Response("", { status: 504 })), NAV_TIMEOUT_MS))
    ]));
  }
});
