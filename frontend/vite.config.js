import { defineConfig } from 'vite';
import react           from '@vitejs/plugin-react';
import { VitePWA }    from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      /**
       * autoUpdate: the SW updates silently in the background.
       * It also handles SW registration — no manual register() call needed.
       */
      registerType: 'autoUpdate',

      // Extra static files (outside the Vite build graph) to pre-cache
      includeAssets: [
        'icons/*.png',
        'icons/*.svg',
        'offline.html',
      ],

      // Generate manifest.json (replaces public/manifest.json)
      manifestFilename: 'manifest.json',
      manifest: {
        id:               '/',
        name:             'Glancify',
        short_name:       'Glancify',
        description:      'Your intelligent, beautiful news reader',
        start_url:        '/',
        scope:            '/',
        display:          'standalone',
        background_color: '#F7F6F3',
        theme_color:      '#1C1917',
        orientation:      'portrait-primary',
        categories:       ['news', 'lifestyle'],
        lang:             'en',
        icons: [
          {
            src:     '/icons/glancify-icon-192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/icons/glancify-icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any',
          },
        ],
      },

      workbox: {
        /**
         * Pre-cache EVERYTHING Vite builds — JS, CSS, HTML, images.
         * Workbox injects the exact hashed filenames at build time,
         * so the SW always caches the right version after each deploy.
         */
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        /**
         * SPA navigation fallback:
         * All navigation requests (opening the app, refreshing) get
         * the cached index.html so React can boot fully offline.
         */
        navigateFallback:          '/index.html',
        navigateFallbackDenylist:  [/^\/api\//],   // API calls must not get index.html

        /**
         * Runtime caching strategies (for requests not in the precache)
         */
        runtimeCaching: [
          {
            /**
             * News API — NetworkFirst with stale fallback.
             * Matches /api/* (Vercel proxies this to Railway in prod,
             * and Vite's dev proxy handles it in local dev).
             * Timeout: 8 s, then serves last cached response so the
             * user sees real articles instead of an empty screen.
             */
            urlPattern:  /\/api\//,
            handler:     'NetworkFirst',
            options: {
              cacheName:             'glancify-api',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries:    80,
                maxAgeSeconds: 60 * 60, // 1 hour — matches backend TTL
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            /**
             * Google Fonts — CacheFirst: font files are immutable.
             * Caches the CSS + woff2 files for a full year.
             */
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName:  'glancify-fonts',
              expiration: {
                maxEntries:    20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
