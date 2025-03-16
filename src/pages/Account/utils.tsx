import { getIcons } from "@/assets/icons";

export const accountItems = [
  {
    id: 1,
    alt: "user",
    title: "My Account",
    path: "/account/profile",
    icon: getIcons("profile_custom"),
    children: getIcons("arrow_right"),
    subtitle: "Make changes to your account",
  },
  {
    id: 2,
    alt: "biometric",
    icon: getIcons("lock"),
    title: "Face ID / Touch ID",
    subtitle: "Manage your device security",
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
    title: "Two-Factor Authentication",
    children: getIcons("arrow_right"),
    subtitle: "Further secure your account for safety",
  },
  {
    id: 4,
    alt: "beneficiary",
    title: "Saved Beneficiary",
    // path: "/account/beneficiaries",
    icon: getIcons("profile_custom"),
    children: getIcons("arrow_right"),
    subtitle: "Manage your saved account",
  },
  {
    id: 5,
    alt: "logout",
    title: "Log out",
    path: "/",
    icon: getIcons("logout"),
    children: getIcons("arrow_right"),
    subtitle: "Further secure your account for safety",
  },
];
export const moreItems = [
  {
    id: 1,
    path: "",
    subtitle: "",
    alt: "notificatoin",
    title: "Help & Support",
    icon: getIcons("notification"),
    children: getIcons("arrow_right"),
  },
  {
    id: 2,
    path: "",
    alt: "heart",
    subtitle: "",
    title: "About App",
    icon: getIcons("lock"),
    children: getIcons("arrow_right"),
  },
];
