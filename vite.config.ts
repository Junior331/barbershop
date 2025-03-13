import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '',
        short_name: 'PWA',
        description: 'Um projeto PWA com React, Vite, Tailwind e Framer Motion',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": "/src",
      lib: '@/lib',
      hooks: '@/hooks',
      pages: '@/pages',
      utils: '@/utils',
      routes: '@/routes',
      assets: '@/assets',
      styles: '@/styles',
      services: '@/services',
      components: '@/components',
    },
  },
})