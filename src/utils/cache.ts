/**
 * Sistema de cache em memória com TTL (Time To Live)
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  /**
   * Armazenar dados no cache
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Recuperar dados do cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Verificar se uma chave existe no cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remover uma chave específica
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpar itens expirados
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instância global do cache
export const appCache = new MemoryCache();

// Limpar cache expirado a cada 10 minutos
setInterval(() => {
  appCache.cleanup();
}, 10 * 60 * 1000);

/**
 * Hook para usar cache de forma reativa
 */
export const useCache = <T>(
  key: string,
  fallback?: () => Promise<T>,
  ttl?: number
) => {
  const get = (): T | null => appCache.get<T>(key);
  
  const set = (data: T): void => appCache.set(key, data, ttl);
  
  const getOrFetch = async (): Promise<T | null> => {
    const cached = get();
    
    if (cached !== null) return cached;
    
    if (fallback) {
      try {
        const data = await fallback();
        set(data);
        return data;
      } catch (error) {
        // Error já será logado pelo useApi
        return null;
      }
    }
    
    return null;
  };

  return {
    get,
    set,
    getOrFetch,
    has: () => appCache.has(key),
    delete: () => appCache.delete(key),
  };
};