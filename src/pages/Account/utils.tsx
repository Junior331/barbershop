import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import { AccountItem, AccountItems } from "./@types";
import { getIcons } from "@/assets/icons";

export const getAccountItems = ({ setAuth, navigate }: AccountItems) => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAuth(null);
      navigate("/signin");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao tentar sair da conta, tente novamente.";
      toast.error(errorMessage);
    }
  };

  return [
    {
      id: 1,
      alt: "user",
      title: "Minha conta",
      icon: getIcons("profile_custom"),
      children: getIcons("arrow_right"),
      subtitle: "Fazer alterações na sua conta",
      path: "/account/profile",
    },
    {
      id: 2,
      alt: "biometric",
      icon: getIcons("lock"),
      title: "Face ID / Touch ID",
      subtitle: "Usar a segurança do seu dispositivo",
      children: (
        <input
          type="checkbox"
          defaultChecked
          className="toggle toggle-primary !bg-transparent border-[#E8E8E8]"
        />
      ),
    },
    {
      id: 3,
      alt: "shield",
      icon: getIcons("shield_done"),
      title: "Autenticação de dois factores",
      children: getIcons("arrow_right"),
      subtitle: "Proteger ainda mais a sua conta",
      path: "",
    },
    {
      id: 4,
      alt: "logout",
      subtitle: "",
      title: "Sair da conta",
      icon: getIcons("logout"),
      handleAction: handleLogout,
      children: getIcons("arrow_right"),
    },
  ] satisfies AccountItem[];
};

export const getMoreItems = () =>
  [
    {
      id: 1,
      subtitle: "",
      alt: "notificatoin",
      title: "Ajuda & Suporte",
      icon: getIcons("notification"),
      children: getIcons("arrow_right"),
      path: "",
    },
    {
      id: 2,
      alt: "heart",
      subtitle: "",
      title: "Sobre o App",
      icon: getIcons("lock"),
      children: getIcons("arrow_right"),
      path: "",
    },
  ] satisfies AccountItem[];
