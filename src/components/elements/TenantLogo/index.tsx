/**
 * Componente de Logo Multi-Tenant
 *
 * Exibe o logo customizado do tenant ou fallback para logo padrão
 */

import { tenantConfig } from '@/config/tenant.config';
import { images } from '@/assets/images';

interface TenantLogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export const TenantLogo = ({
  className = '',
  alt,
  width,
  height,
}: TenantLogoProps) => {
  const logoUrl = tenantConfig.logoUrl || images.logo;
  const logoAlt = alt || `Logo ${tenantConfig.name}`;

  return (
    <img
      src={logoUrl}
      alt={logoAlt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      onError={(e) => {
        // Fallback para logo padrão em caso de erro
        const target = e.target as HTMLImageElement;
        if (target.src !== images.logo) {
          console.warn('[TenantLogo] Falha ao carregar logo customizado, usando fallback');
          target.src = images.logo;
        }
      }}
    />
  );
};

export default TenantLogo;
