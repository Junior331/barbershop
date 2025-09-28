/**
 * Sistema de logging condicional baseado no ambiente
 */
const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    // Erros sempre são logados
    console.error(`[ERROR] ${message}`, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  auth: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[AUTH] ${message}`, ...args);
    }
  },

  api: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[API] ${message}`, ...args);
    }
  },
};