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
        short_name: 'Barbershop',
        description: 'Agende seu corte em poucos clicks',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'src/assets/icons/app_icon_ia.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'src/assets/icons/app_icon_ia.png',
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