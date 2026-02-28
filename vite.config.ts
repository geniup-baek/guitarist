import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Guitarist',
        short_name: 'Guitarist',
        description: 'A premium, cross-platform guitarist application.',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        id: './',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache'
            }
          },
          {
            urlPattern: ({ request }) => ['script', 'style', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'asset-cache'
            }
          }
        ]
      }
    })
  ],
})
