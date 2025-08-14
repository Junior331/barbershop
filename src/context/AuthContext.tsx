import { IUserData } from "@/utils/types";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: IUserData | null;
  setAuth: (user: IUserData | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para fazer logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Limpar dados do localStorage se necessário
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para definir autenticação
  const setAuth = (authUser: IUserData | null) => {
    setUser(authUser);
    // Persistir no localStorage
    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Verificar sessão inicial e configurar listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Verificar se o token não expirou
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            // Token expirado, fazer logout
            await logout();
            setIsLoading(false);
            return;
          }

          // Buscar dados do usuário
          const { data: customUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Erro ao buscar dados do usuário:", error.message);
            // Se não conseguir buscar dados customizados, usar apenas os dados do Supabase
            setAuth({
              id: session.user.id,
              email: session.user.email || '',
              phone: session.user.phone,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
            });
          } else {
            setAuth({
              id: session.user.id,
              email: session.user.email || '',
              phone: session.user.phone,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
              ...customUser,
            });
          }
        } else {
          // Tentar recuperar do localStorage
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              // Verificar se ainda é válido
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              if (!currentSession) {
                localStorage.removeItem('user');
              } else {
                setUser(parsedUser);
              }
            } catch {
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: customUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar dados do usuário:", error.message);
          // Se não conseguir buscar dados customizados, usar apenas os dados do Supabase
          setAuth({
            id: session.user.id,
            email: session.user.email || '',
            phone: session.user.phone,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at,
          });
        } else {
          setAuth({
            id: session.user.id,
            email: session.user.email || '',
            phone: session.user.phone,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at,
            ...customUser,
          });
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setAuth(null);
      }
    });

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  // Verificar periodicamente se o token expirou
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiration = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        await logout();
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await logout();
      }
    };

    // Verificar a cada 5 minutos
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);