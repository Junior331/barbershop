import pole from "./pole.svg";
import home from "./home.svg";
import edit from "./edit.svg";
import trash from "./trash.svg";
import camera from "./camera.svg";
import wallet from "./wallet.svg";
import profile from "./profile.svg";
import calendar from "./calendar.svg";
import card_add from "./card_add.svg";
import pole_left from "./pole_left.svg";
import user_edit from "./user_edit.svg";
import star_solid from "./star_solid.svg";
import pole_right from "./pole_right.svg";
import eye_outline from "./eye_outline.svg";
import arrow_right from "./arrow_right.svg";
import apple_solid from "./apple_solid.svg";
import card_credit from "./card_credit.svg";
import home_active from "./home_active.svg";
import social_apple from "./social_apple.svg";
import social_google from "./social_google.svg";
import wallet_active from "./wallet_active.svg";
import fallback from "../images/placeholder.svg";
import profile_active from "./profile_active.svg";
import clock_outlined from "./clock_outlined.svg";
import social_facebook from "./social_facebook.svg";
import calendar_active from "./calendar_active.svg";
import eye_slash_outline from "./eye_slash_outline.svg";
import arrow_circle_left from "./arrow_circle_left.svg";
import location_outlined from "./location_outlined.svg";
import calendar_solid_white from "./calendar_solid_white.svg";

import lock from "./lock.svg";
import heart from "./heart.svg";
import logout from "./logout.svg";
import shield_done from "./shield_done.svg";
import notification from "./notification.svg";
import profile_custom from "./profile_custom.svg";

export const icons = {
  pole,
  home,
  edit,
  trash,
  camera,
  wallet,
  profile,
  fallback,
  calendar,
  card_add,
  pole_left,
  user_edit,
  star_solid,
  pole_right,
  eye_outline,
  arrow_right,
  apple_solid,
  card_credit,
  home_active,
  social_apple,
  wallet_active,
  social_google,
  clock_outlined,
  profile_active,
  calendar_active,
  social_facebook,
  eye_slash_outline,
  arrow_circle_left,
  location_outlined,
  calendar_solid_white,

  lock,
  heart,
  logout,
  shield_done,
  notification,
  profile_custom,
};

type IIcons = keyof typeof icons;

export const getIcons = (id: IIcons) => {
  return icons[id] ?? icons.fallback;
};
