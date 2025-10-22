import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { htmlEnvPlugin } from './src/plugins/html-env-plugin'

export default defineConfig(({ mode }) => {
  // Carregar env vars
  const env = loadEnv(mode, process.cwd(), '')

  // Configurações dinâmicas do tenant
  const tenantName = env.VITE_TENANT_NAME || 'Barbershop'
  const tenantShortName = (env.VITE_TENANT_NAME || 'Barbershop').substring(0, 12)
  const primaryColor = env.VITE_PRIMARY_COLOR || '#3b82f6'
  const iconUrl = env.VITE_LOGO_URL || '/app_icon_ia.png'

  return {
    plugins: [
      react(),
      tailwindcss(),
      htmlEnvPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: tenantName,
          short_name: tenantShortName,
          theme_color: primaryColor,
          background_color: '#F7F8FD',
          description: `Agende seu corte na ${tenantName} em poucos clicks`,
          icons: [
              {
                src: iconUrl,
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: iconUrl,
                sizes: '512x512',
                type: 'image/png',
              },
              {
                src: iconUrl,
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
  }
})