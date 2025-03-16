import { getIcons } from "@/assets/icons";

export const routes = [
  {
    id: 1,
    name: "Home",
    path: "/home",
    icon: getIcons("home"),
    icon_active: getIcons("home_active"),
  },
  {
    id: 2,
    name: "Wallet",
    path: "/wallet",
    icon: getIcons("wallet"),
    icon_active: getIcons("wallet_active"),
  },
  {
    id: 3,
    name: "Calendar",
    path: "/calendar",
    icon: getIcons("calendar"),
    icon_active: getIcons("calendar_active"),
  },
  {
    id: 4,
    name: "Account",
    path: "/account",
    icon: getIcons("profile"),
    icon_active: getIcons("profile_active"),
  },
];
