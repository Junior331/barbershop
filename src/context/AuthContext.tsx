import { IUserData } from "@/utils/types";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
  user: IUserData | null;
  setAuth: (user: IUserData | null) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUserData | null>(null);

  const setAuth = (authUser: IUserData | null) => {
    setUser(authUser);
  };

  return (
    <AuthContext.Provider value={{ user, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);