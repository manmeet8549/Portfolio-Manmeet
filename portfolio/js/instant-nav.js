/**
 * Instant Navigation & Prefetching Engine
 * 1. Registers portfolio Service Worker for instant offline/cached page loads.
 * 2. Listens for link hover & touch events to prefetch pages into browser cache in < 10ms.
 */

(function () {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('⚡ ServiceWorker registered successfully:', reg.scope);
                })
                .catch(err => {
                    console.warn('ServiceWorker registration failed:', err);
                });
        });
    }

    // 2. Link Prefetching Engine
    const prefetched = new Set();

    function prefetchUrl(url) {
        if (!url || prefetched.has(url)) return;

        try {
            const parsed = new URL(url, window.location.href);
            // Only prefetch internal links
            if (parsed.origin !== window.location.origin) return;
            if (parsed.pathname === window.location.pathname) return;

            prefetched.add(url);

            // Create prefetch link element
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            link.as = 'document';
            document.head.appendChild(link);

            // Also trigger fetch for Service Worker cache
            fetch(url, { priority: 'low' }).catch(() => {});
        } catch (e) {
            // Ignore invalid URLs
        }
    }

    function initLinkPrefetching() {
        document.addEventListener('mouseover', (e) => {
            const anchor = e.target.closest('a');
            if (anchor && anchor.href) {
                prefetchUrl(anchor.href);
            }
        }, { passive: true });

        document.addEventListener('touchstart', (e) => {
            const anchor = e.target.closest('a');
            if (anchor && anchor.href) {
                prefetchUrl(anchor.href);
            }
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLinkPrefetching);
    } else {
        initLinkPrefetching();
    }
})();
