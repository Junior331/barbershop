import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return { handleLogout };
}; 