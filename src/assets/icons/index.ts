import pole from "./pole.svg";
import social_apple from "./social_apple.svg";
import social_google from "./social_google.svg";
import fallback from "../images/placeholder.svg";
import social_facebook from "./social_facebook.svg";
export const icons = {
  pole,
  fallback,
  social_apple,
  social_google,
  social_facebook,
};

type IIcons = keyof typeof icons;

export const getIcons = (id: IIcons) => {
  return icons[id] ?? icons.fallback;
};
