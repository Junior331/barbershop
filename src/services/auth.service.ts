import { api, ApiUtils } from './api';
import { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

// Tipos de dados para autenticação
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CLIENT' | 'BARBER'; // Permitir especificar role
  provider?: 'LOCAL';
}

export interface SocialAuthData {
  name: string;
  email: string;
  provider: 'GOOGLE' | 'FACEBOOK' | 'APPLE';
  providerId: string;
  avatarUrl?: string;
  accessToken?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'BARBER' | 'ADMIN' | 'OWNER';
  avatarUrl?: string;
  provider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'APPLE';
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
  field?: string;
}

export const authService = {
  // Login com email/senha
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      logger.info('Iniciando login:', { email: data.email });

      const response = await api.post('/auth/login', data);

      logger.info('Login realizado com sucesso:', {
        userId: response.data.user.id,
        role: response.data.user.role
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'authService.login');
      throw this.formatAuthError(error as AxiosError);
    }
  },

  // Registro com email/senha
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      logger.info('Iniciando registro:', {
        email: data.email,
        role: data.role || 'CLIENT'
      });

      // Garantir que sempre tenha provider LOCAL para registro manual
      const registerPayload: RegisterData = {
        ...data,
        role: data.role || 'CLIENT',
        provider: 'LOCAL',
      };

      const response = await api.post('/auth/register', registerPayload);

      logger.info('Registro realizado com sucesso:', {
        userId: response.data.user.id,
        role: response.data.user.role
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'authService.register');
      throw this.formatAuthError(error as AxiosError);
    }
  },

  // Login/Registro social (Google, Facebook, Apple)
  async socialAuth(data: SocialAuthData): Promise<AuthResponse> {
    try {
      logger.info('Iniciando autenticação social:', {
        email: data.email,
        provider: data.provider
      });

      const response = await api.post('/auth/social', data);

      logger.info('Autenticação social realizada com sucesso:', {
        userId: response.data.user.id,
        provider: data.provider
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'authService.socialAuth');
      throw this.formatAuthError(error as AxiosError);
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      logger.info('Renovando token de acesso');

      const response = await api.post('/auth/refresh', { refreshToken });

      logger.info('Token renovado com sucesso');

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'authService.refreshToken');

      // Para refresh token, não vamos formatar o erro, deixamos o interceptor lidar
      throw error;
    }
  },

  // Dados do usuário atual
  async me(): Promise<User> {
    try {
      logger.info('Buscando dados do usuário atual');

      const response = await api.get('/auth/me');

      logger.info('Dados do usuário obtidos com sucesso:', {
        userId: response.data.id,
        role: response.data.role
      });

      // A API retorna o usuário diretamente, não em um objeto wrapper
      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'authService.me');
      throw this.formatAuthError(error as AxiosError);
    }
  },

  // Validar se email existe
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    try {
      const response = await api.post('/auth/check-email', { email });
      return response.data;
    } catch (error) {
      // Se der erro 404, email não existe
      if ((error as AxiosError).response?.status === 404) {
        return { exists: false };
      }
      throw this.formatAuthError(error as AxiosError);
    }
  },

  // Logout (limpar dados locais)
  async logout(): Promise<void> {
    try {
      logger.info('Fazendo logout');

      // Opcional: chamar endpoint de logout no backend se existir
      // await api.post('/auth/logout');

      logger.info('Logout realizado com sucesso');
    } catch (error) {
      // Mesmo se der erro no backend, continua com logout local
      logger.warn('Erro ao fazer logout no backend, continuando com logout local:', error);
    }
  },

  // Formatar erros de autenticação
  formatAuthError(error: AxiosError): AuthError {
    const response = error.response;
    const data = response?.data as any;

    // Erro de validação (400)
    if (response?.status === 400) {
      if (Array.isArray(data.message)) {
        return {
          message: data.message[0], // Primeira mensagem de validação
          statusCode: 400,
          field: this.extractFieldFromValidationMessage(data.message[0])
        };
      }
      return {
        message: data.message || 'Dados inválidos',
        statusCode: 400
      };
    }

    // Credenciais inválidas (401)
    if (response?.status === 401) {
      return {
        message: 'Email ou senha incorretos',
        statusCode: 401
      };
    }

    // Email já existe (409)
    if (response?.status === 409) {
      return {
        message: 'Este email já está em uso',
        statusCode: 409,
        field: 'email'
      };
    }

    // Erro de rede
    if (ApiUtils.isNetworkError(error)) {
      return {
        message: 'Erro de conexão. Verifique sua internet.',
        statusCode: 0
      };
    }

    // Erro genérico
    return {
      message: data?.message || 'Erro interno do servidor',
      statusCode: response?.status || 500
    };
  },

  // Extrair campo de mensagem de validação
  extractFieldFromValidationMessage(message: string): string | undefined {
    // Mensagens como "email must be an email" -> "email"
    if (message.includes('email')) return 'email';
    if (message.includes('password')) return 'password';
    if (message.includes('name')) return 'name';
    if (message.includes('phone')) return 'phone';
    return undefined;
  }
};

// Interface para reset password
export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  user: User;
}

// Adicionar método de reset password
export const resetPasswordService = {
  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    try {
      logger.info('Iniciando reset de senha:', { email: data.email });

      const response = await api.post('/auth/reset-password', data);

      logger.info('Reset de senha realizado com sucesso');

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'resetPasswordService.resetPassword');
      throw authService.formatAuthError(error as AxiosError);
    }
  }
};