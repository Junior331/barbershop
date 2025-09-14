import axios from 'axios';
import { cookieUtils, COOKIE_NAMES } from '@/utils/cookies';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';

// Base URL da API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Criar instância do axios
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = cookieUtils.get(COOKIE_NAMES.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.api(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    logger.error('Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    logger.api(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const { response, config } = error;

    logger.error(`❌ ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: response?.status,
      data: response?.data,
    });

    // Token expirado - tentar refresh
    if (response?.status === 401 && !config?._retry) {
      config._retry = true;

      try {
        const refreshToken = cookieUtils.get(COOKIE_NAMES.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Fazer refresh do token
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = refreshResponse.data;

        // Salvar novo token
        cookieUtils.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
          expires: 7,
          secure: true,
          sameSite: 'Strict'
        });

        // Repetir requisição original
        config.headers.Authorization = `Bearer ${accessToken}`;
        return api(config);

      } catch (refreshError) {
        // Refresh falhou - redirecionar para login
        logger.error('Refresh token failed:', refreshError);
        cookieUtils.remove(COOKIE_NAMES.ACCESS_TOKEN);
        cookieUtils.remove(COOKIE_NAMES.REFRESH_TOKEN);
        cookieUtils.remove(COOKIE_NAMES.USER_DATA);

        toast.error('Sessão expirada. Faça login novamente.');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    // Tratar outros erros
    const errorMessage = response?.data?.message || 'Erro na requisição';

    // Não mostrar toast para alguns erros específicos
    const silentErrors = [401, 404];
    if (!silentErrors.includes(response?.status)) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;