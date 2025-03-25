import { getIcons } from "@/assets/icons";

export const accountItems = [
  {
    id: 1,
    alt: "user",
    title: "Minha conta",
    path: "/account/profile",
    icon: getIcons("profile_custom"),
    children: getIcons("arrow_right"),
    subtitle: "Fazer alterações na sua conta",
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
    // path: "/account/security/2fa",
    title: "Autenticação de dois factores",
    children: getIcons("arrow_right"),
    subtitle: "Proteger ainda mais a sua conta",
  },
  {
    id: 4,
    alt: "logout",
    title: "Sair do conta",
    path: "/",
    icon: getIcons("logout"),
    children: getIcons("arrow_right"),
    subtitle: "",
  },
];
export const moreItems = [
  {
    id: 1,
    path: "",
    subtitle: "",
    alt: "notificatoin",
    title: "Ajuda & Suporte",
    icon: getIcons("notification"),
    children: getIcons("arrow_right"),
  },
  {
    id: 2,
    path: "",
    alt: "heart",
    subtitle: "",
    title: "Sobre o App",
    icon: getIcons("lock"),
    children: getIcons("arrow_right"),
  },
];
