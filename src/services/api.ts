import axios, { AxiosError, AxiosResponse } from 'axios';
import { cookieUtils, COOKIE_NAMES } from '@/utils/cookies';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';

// Base URL da API - Usando a nova URL do backend
const BASE_URL = import.meta.env.VITE_API_URL || 'https://barbearia-backend-develop.onrender.com';

// Tipos para melhor tipagem
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Criar instância do axios com configurações otimizadas
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Aumentado para 30s (Render pode ser lento)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Para cookies de sessão
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = cookieUtils.get(COOKIE_NAMES.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar headers customizados se necessário
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // Log apenas em desenvolvimento
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      logger.api(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error: AxiosError) => {
    logger.error('Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log apenas em desenvolvimento
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      logger.api(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const { response, config } = error;

    // Log do erro
    logger.error(`❌ ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: response?.status,
      data: response?.data,
      message: error.message,
    });

    // Token expirado - tentar refresh automaticamente
    if (response?.status === 401 && !(config as any)?._retry && config?.url !== '/auth/refresh') {
      (config as any)._retry = true;

      try {
        const refreshToken = cookieUtils.get(COOKIE_NAMES.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        logger.info('Tentando refresh do token...');

        // Fazer refresh do token usando uma instância limpa do axios
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Salvar novos tokens
        cookieUtils.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
          expires: 1, // 1 dia
          secure: true,
          sameSite: 'Strict'
        });

        if (newRefreshToken) {
          cookieUtils.set(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, {
            expires: 7, // 7 dias
            secure: true,
            sameSite: 'Strict'
          });
        }

        // Repetir requisição original com novo token
        if (config && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        logger.info('Token refreshed successfully, retrying original request');
        return api(config!);

      } catch (refreshError) {
        // Refresh falhou - limpar dados e redirecionar
        logger.error('Refresh token failed:', refreshError);

        // Limpar todos os dados de autenticação
        cookieUtils.remove(COOKIE_NAMES.ACCESS_TOKEN);
        cookieUtils.remove(COOKIE_NAMES.REFRESH_TOKEN);
        cookieUtils.remove(COOKIE_NAMES.USER_DATA);

        // Notificar usuário e redirecionar
        toast.error('Sessão expirada. Redirecionando para login...');

        // Pequeno delay para o usuário ver a mensagem
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);

        return Promise.reject(refreshError);
      }
    }

    // Tratar outros tipos de erro
    const errorMessage = (response?.data as any)?.message || error.message || 'Erro na requisição';
    const status = response?.status;

    // Não mostrar toast para alguns erros específicos
    const silentErrors = [401]; // 401 já é tratado acima
    const networkError = !response && error.code === 'NETWORK_ERROR';

    if (!silentErrors.includes(status as number) && !networkError) {
      // Personalizar mensagens de erro
      if (status === 404) {
        toast.error('Recurso não encontrado');
      } else if (status === 403) {
        toast.error('Acesso negado');
      } else if (status === 500) {
        toast.error('Erro interno do servidor');
      } else if (networkError) {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else {
        toast.error(errorMessage);
      }
    }

    return Promise.reject(error);
  }
);

// Funções utilitárias para a API
export const ApiUtils = {
  // Verificar se a API está disponível
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  // Extrair erro da resposta
  extractErrorMessage(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      return data.message || data.error || 'Erro desconhecido';
    }
    return error.message || 'Erro na requisição';
  },

  // Verificar se é erro de rede
  isNetworkError(error: AxiosError): boolean {
    return !error.response && (error.code === 'NETWORK_ERROR' || error.code === 'ENOTFOUND');
  },

  // Verificar se é erro de timeout
  isTimeoutError(error: AxiosError): boolean {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  },

  // Log estruturado de erro
  logError(error: AxiosError, context?: string) {
    const errorInfo = {
      context,
      status: error.response?.status,
      message: this.extractErrorMessage(error),
      url: error.config?.url,
      method: error.config?.method,
      isNetwork: this.isNetworkError(error),
      isTimeout: this.isTimeoutError(error),
    };

    logger.error('API Error:', errorInfo);
    return errorInfo;
  }
};

export default api;