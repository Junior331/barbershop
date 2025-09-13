import { IUserData } from "@/utils/types";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cookieUtils, COOKIE_NAMES } from "@/utils/cookies";
import { logger } from "@/utils/logger";
import toast from "react-hot-toast";

interface AuthContextType {
  user: IUserData | null;
  setAuth: (user: IUserData | null, token?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para fazer logout
  const logout = useCallback(() => {
    try {
      setUser(null);
      cookieUtils.remove(COOKIE_NAMES.ACCESS_TOKEN);
      cookieUtils.remove(COOKIE_NAMES.USER_DATA);
      toast.success('Logout realizado com sucesso');
      logger.auth('Logout realizado');
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  }, []);

  // Função para definir autenticação com cookies seguros
  const setAuth = useCallback((authUser: IUserData | null, token?: string) => {
    setUser(authUser);
    
    if (authUser) {
      // Salvar dados do usuário em cookie seguro
      cookieUtils.set(COOKIE_NAMES.USER_DATA, JSON.stringify(authUser), {
        expires: 7, // 7 dias
        secure: true,
        sameSite: 'Strict'
      });

      // Salvar token se fornecido
      if (token) {
        cookieUtils.set(COOKIE_NAMES.ACCESS_TOKEN, token, {
          expires: 7, // 7 dias
          secure: true,
          sameSite: 'Strict'
        });
      }

      logger.auth('Usuário autenticado e salvo em cookies');
    } else {
      cookieUtils.remove(COOKIE_NAMES.ACCESS_TOKEN);
      cookieUtils.remove(COOKIE_NAMES.USER_DATA);
      logger.auth('Dados de autenticação removidos dos cookies');
    }
  }, []);

  // Verificar sessão inicial
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Verificar se existe token e dados do usuário nos cookies
        const token = cookieUtils.get(COOKIE_NAMES.ACCESS_TOKEN);
        const userDataString = cookieUtils.get(COOKIE_NAMES.USER_DATA);

        if (token && userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            setUser(userData);
            logger.auth('Usuário restaurado dos cookies');
          } catch (error) {
            logger.error('Erro ao parsear dados do usuário dos cookies:', error);
            // Se dados estão corrompidos, limpar cookies
            cookieUtils.remove(COOKIE_NAMES.ACCESS_TOKEN);
            cookieUtils.remove(COOKIE_NAMES.USER_DATA);
            setUser(null);
          }
        } else {
          // Sem token ou dados do usuário
          setUser(null);
          logger.auth('Nenhum token ou dados encontrados nos cookies');
        }
      } catch (error) {
        logger.error('Erro ao inicializar autenticação:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setAuth, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);