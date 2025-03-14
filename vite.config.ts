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
        description: 'Agende seu corte em poucos clicks',
        theme_color: '#f7f8fd',
        background_color: '#f7f8fd',
        icons: [  
            {
              src: '/app_icon_ia.png', // Ícone do app (192x192)
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/splash_icon.png', // Ícone da splash screen (512x512)
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/splash_icon.png', // Ícone para dispositivos com tela maior
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