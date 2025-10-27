/**
 * Plugin Vite para injetar env vars no index.html
 *
 * Substitui placeholders %VITE_VAR_NAME% pelos valores reais
 */

import type { Plugin } from 'vite';

export function htmlEnvPlugin(): Plugin {
  return {
    name: 'html-env-plugin',
    transformIndexHtml(html) {
      // Substituir env vars no HTML
      return html.replace(/%(\w+)%/g, (match, key) => {
        const value = process.env[key];

        // Se não encontrar a variável, usar um fallback
        if (!value || value === match) {
          const defaults: Record<string, string> = {
            'VITE_TENANT_NAME': 'Barbershop',
            'VITE_PRIMARY_COLOR': '#3b82f6',
            'VITE_SECONDARY_COLOR': '#8b5cf6',
          };
          return defaults[key] || match;
        }

        return value;
      });
    },
  };
}
