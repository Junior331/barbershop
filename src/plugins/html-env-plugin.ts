/**
 * Plugin Vite para injetar env vars no index.html
 *
 * Substitui placeholders %VITE_VAR_NAME% pelos valores reais
 */

import type { Plugin } from 'vite';

export function htmlEnvPlugin(): Plugin {
  return {
    name: 'html-env-plugin',
    transformIndexHtml(html, ctx) {
      // Substituir env vars no HTML
      return html.replace(/%(\w+)%/g, (match, key) => {
        const value = ctx.server?.config.env[key] || process.env[key] || match;
        return value;
      });
    },
  };
}
