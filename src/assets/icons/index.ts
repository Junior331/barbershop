import pole from "./pole.svg";
import home from "./home.svg";
import edit from "./edit.svg";
import trash from "./trash.svg";
import wallet from "./wallet.svg";
import profile from "./profile.svg";
import calendar from "./calendar.svg";
import pole_left from "./pole_left.svg";
import star_solid from "./star_solid.svg";
import pole_right from "./pole_right.svg";
import home_active from "./home_active.svg";
import social_apple from "./social_apple.svg";
import social_google from "./social_google.svg";
import wallet_active from "./wallet_active.svg";
import fallback from "../images/placeholder.svg";
import profile_active from "./profile_active.svg";
import clock_outlined from "./clock_outlined.svg";
import social_facebook from "./social_facebook.svg";
import calendar_active from "./calendar_active.svg";
import arrow_circle_left from "./arrow_circle_left.svg";
import location_outlined from "./location_outlined.svg";
import calendar_solid_white from "./calendar_solid_white.svg";

export const icons = {
  pole,
  home,
  edit,
  trash,
  wallet,
  profile,
  fallback,
  calendar,
  pole_left,
  star_solid,
  pole_right,
  home_active,
  social_apple,
  wallet_active,
  social_google,
  clock_outlined,
  profile_active,
  calendar_active,
  social_facebook,
  arrow_circle_left,
  location_outlined,
  calendar_solid_white,
};

type IIcons = keyof typeof icons;

export const getIcons = (id: IIcons) => {
  return icons[id] ?? icons.fallback;
};
