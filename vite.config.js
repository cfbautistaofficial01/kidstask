import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SuperKid Quest V2',
        short_name: 'SuperKid V2',
        description: 'A gamified task tracker for super kids!',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: "image/png"
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: "image/png"
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: "image/png",
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/kidstask/',
});
