// KongoFix Service Worker
// Stale-while-revalidate for static assets, network-first for pages
// Cache limit: max 50 entries, LRU eviction

const CACHE_NAME = "kongofix-v2";
const STATIC_ASSETS = ["/", "/manifest.json"];
const MAX_CACHE_ENTRIES = 50;

// Cache entry tracker for LRU eviction
const cacheAccessMap = new Map();

// Offline fallback page — styled HTML shown when the user is offline
const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hors ligne — KongoFix</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .offline-card {
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .offline-logo {
      width: 200px;
      height: auto;
      margin: 0 auto 32px;
    }
    .offline-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #fee2e2;
      color: #ef4444;
      font-size: 28px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #0f172a;
    }
    p {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .retry-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      font-family: inherit;
      text-decoration: none;
    }
    .retry-btn:hover {
      background: #1d4ed8;
    }
    .retry-btn:active {
      transform: scale(0.97);
    }
    .retry-btn svg {
      width: 18px;
      height: 18px;
    }
    .offline-hint {
      margin-top: 16px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="offline-card">
    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMTIwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjEyMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjU2M2ViO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZDRlZDg7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICAKICA8IS0tIFdyZW5jaCBpY29uIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMwLCAyMCkiPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTgiIGZpbGw9InVybCgjZ3JhZCkiLz4KICAgIDx0ZXh0IHg9IjQwIiB5PSI1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiPvCflKc8L3RleHQ+CiAgPC9nPgogIAogIDwhLS0gS29uZ29GaXggdGV4dCAtLT4KICA8dGV4dCB4PSIxMjUiIHk9IjUyIiBmb250LWZhbWlseT0iJ1NlZ29lIFVJJywgc3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM0IiBmb250LXdlaWdodD0iODAwIiBmaWxsPSIjMWUyOTNiIiBsZXR0ZXItc3BhY2luZz0iLTAuNSI+S29uZ288L3RleHQ+CiAgPHRleHQgeD0iMjMyIiB5PSI1MiIgZm9udC1mYW1pbHk9IidTZWdvZSBVSScsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNCIgZm9udC13ZWlnaHQ9IjgwMCIgZmlsbD0iIzI1NjNlYiIgbGV0dGVyLXNwYWNpbmc9Ii0wLjUiPkZpeDwvdGV4dD4KICAKICA8IS0tIFRhZ2xpbmUgLS0+CiAgPHRleHQgeD0iMTI3IiB5PSI3NiIgZm9udC1mYW1pbHk9IidTZWdvZSBVSScsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZmlsbD0iIzY0NzQ4YiIgbGV0dGVyLXNwYWNpbmc9IjAuNSI+U0VSVklDRVMgVEVDSE5JUVVFUyDDgCBET01JQ0lMRTwvdGV4dD4KPC9zdmc+" alt="KongoFix" class="offline-logo" width="200">
    <div class="offline-icon">&#x26A0;</div>
    <h1>Vous êtes hors ligne</h1>
    <p>Connectez-vous à Internet pour accéder à KongoFix.</p>
    <button class="retry-btn" onclick="location.reload()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
      Réessayer
    </button>
    <p class="offline-hint">Une fois reconnecté, la page se rechargera.</p>
  </div>
</body>
</html>`;

/**
 * Limit cache entries using LRU eviction
 */
async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_CACHE_ENTRIES) {
    // Sort by last access time (oldest first)
    const sorted = keys
      .map((req) => ({ req, time: cacheAccessMap.get(req.url) || 0 }))
      .sort((a, b) => a.time - b.time);
    const toDelete = sorted.slice(0, keys.length - MAX_CACHE_ENTRIES);
    for (const { req } of toDelete) {
      await cache.delete(req);
      cacheAccessMap.delete(req.url);
    }
  }
}

/**
 * Update cache and record access time
 */
async function updateCache(cache, request, response) {
  cacheAccessMap.set(request.url, Date.now());
  await cache.put(request, response.clone());
  await trimCache(cache);
}

/**
 * Stale-while-revalidate: return cached version immediately,
 * then update cache from network in background
 */
function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(async (cache) => {
    const cached = await cache.match(request);
    const networkFetch = fetch(request)
      .then((response) => {
        updateCache(cache, request, response);
        return response;
      })
      .catch(() => {
        // network failed, cached version is fine
      });

    // Return cached immediately if available
    if (cached) {
      // Fire-and-forget the network update
      return cached;
    }
    // No cache: wait for network
    return networkFetch;
  });
}

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Don't fail if some assets can't be cached
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate for static, network-first for pages
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls and server functions
  if (url.pathname.startsWith("/api/")) return;

  // For pages (HTML navigation): network-first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            updateCache(cache, event.request, cloned);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(
            (cached) =>
              cached ||
              new Response(OFFLINE_PAGE, {
                status: 503,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              })
          );
        })
    );
    return;
  }

  // For static assets (JS, CSS, images, fonts): stale-while-revalidate
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/_build/") ||
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          updateCache(cache, event.request, cloned);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(
          (cached) =>
            cached ||
            new Response(OFFLINE_PAGE, {
              status: 503,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
        );
      })
  );
});
