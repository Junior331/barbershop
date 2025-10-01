/**
 * Utilitários para gerenciar cookies seguros
 */

interface CookieOptions {
  expires?: number; // dias
  maxAge?: number; // segundos
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;
}

export const cookieUtils = {
  /**
   * Define um cookie
   */
  set: (name: string, value: string, options: CookieOptions = {}) => {
    const {
      expires,
      maxAge,
      path = '/',
      domain,
      secure = window.location.protocol === 'https:',
      sameSite = 'Strict',
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
      const date = new Date();
      date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    if (maxAge) {
      cookieString += `; max-age=${maxAge}`;
    }

    if (path) {
      cookieString += `; path=${path}`;
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += '; secure';
    }

    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }

    document.cookie = cookieString;
  },

  /**
   * Obtém um cookie
   */
  get: (name: string): string | null => {
    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      
      if (cookieName === encodedName) {
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }
    }

    return null;
  },

  /**
   * Remove um cookie
   */
  remove: (name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}) => {
    cookieUtils.set(name, '', {
      ...options,
      expires: -1,
    });
  },

  /**
   * Verifica se um cookie existe
   */
  exists: (name: string): boolean => {
    return cookieUtils.get(name) !== null;
  },

  /**
   * Obtém todos os cookies
   */
  getAll: (): Record<string, string> => {
    const cookies: Record<string, string> = {};
    
    if (document.cookie) {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      });
    }

    return cookies;
  },

  /**
   * Limpa todos os cookies do domínio atual
   */
  clearAll: () => {
    const cookies = cookieUtils.getAll();
    
    Object.keys(cookies).forEach(name => {
      cookieUtils.remove(name);
      // Tentar remover também com path raiz
      cookieUtils.remove(name, { path: '/' });
    });
  }
};

// Constantes para nomes de cookies
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;