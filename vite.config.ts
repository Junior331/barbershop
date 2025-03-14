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
        name: 'Barbershop',
        short_name: 'Barbershop',
        theme_color: '#6B7280',
        background_color: '#F7F8FD',
        description: 'Agende seu corte em poucos clicks',
        icons: [  
            {
              src: '/app_icon_ia.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/app_icon_ia.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/app_icon_ia.png',
              sizes: '1024x1024',
              type: 'image/png',
              purpose: 'maskable',
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