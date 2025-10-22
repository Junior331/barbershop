/**
 * Configuração Multi-Tenant
 *
 * Este arquivo gerencia as configurações específicas de cada tenant (barbearia).
 * As variáveis são injetadas no build time pelo sistema de geração de apps.
 */

export interface TenantConfig {
  slug: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  apiUrl: string;
}

/**
 * Configuração do tenant atual
 * Lê das variáveis de ambiente injetadas no build
 */
export const tenantConfig: TenantConfig = {
  slug: import.meta.env.VITE_TENANT_SLUG || 'demo',
  name: import.meta.env.VITE_TENANT_NAME || 'Barbershop Demo',
  primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#3b82f6',
  secondaryColor: import.meta.env.VITE_SECONDARY_COLOR || '#8b5cf6',
  logoUrl: import.meta.env.VITE_LOGO_URL,
  faviconUrl: import.meta.env.VITE_FAVICON_URL,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
};

/**
 * Helper para obter cor primária com opacidade
 */
export const getPrimaryColor = (opacity: number = 1): string => {
  const color = tenantConfig.primaryColor;
  if (opacity === 1) return color;

  // Converter hex para rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Helper para obter cor secundária com opacidade
 */
export const getSecondaryColor = (opacity: number = 1): string => {
  const color = tenantConfig.secondaryColor;
  if (opacity === 1) return color;

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Validar se a configuração do tenant está completa
 */
export const validateTenantConfig = (): boolean => {
  const required = ['slug', 'name', 'apiUrl'];
  return required.every(key => Boolean(tenantConfig[key as keyof TenantConfig]));
};

// Validar ao carregar
if (!validateTenantConfig()) {
  console.warn('[Tenant Config] Configuração incompleta. Usando valores padrão.');
}
