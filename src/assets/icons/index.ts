import pole from "./pole.svg";
import pole_left from "./pole_left.svg";
import pole_right from "./pole_right.svg";
import social_apple from "./social_apple.svg";
import social_google from "./social_google.svg";
import fallback from "../images/placeholder.svg";
import social_facebook from "./social_facebook.svg";

import home from "./home.svg";
import wallet from "./wallet.svg";
import profile from "./profile.svg";
import calendar from "./calendar.svg";
import home_active from "./home_active.svg";
import wallet_active from "./wallet_active.svg";
import profile_active from "./profile_active.svg";
import calendar_active from "./calendar_active.svg";

export const icons = {
  pole,
  fallback,
  pole_left,
  pole_right,
  social_apple,
  social_google,
  social_facebook,

  home,
  wallet,
  profile,
  calendar,
  home_active,
  wallet_active,
  profile_active,
  calendar_active,
};

type IIcons = keyof typeof icons;

export const getIcons = (id: IIcons) => {
  return icons[id] ?? icons.fallback;
};
