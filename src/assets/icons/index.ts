import pole from "./pole.svg";
import home from "./home.svg";
import edit from "./edit.svg";
import trash from "./trash.svg";
import camera from "./camera.svg";
import wallet from "./wallet.svg";
import barber from "./barber.png";
import profile from "./profile.svg";
import calendar from "./calendar.svg";
import card_add from "./card_add.svg";
import pix_solid from "./pix_solid.png";
import trash_red from "./trash_red.svg";
import pole_left from "./pole_left.svg";
import user_edit from "./user_edit.svg";
import star_solid from "./star_solid.svg";
import pole_right from "./pole_right.svg";
import eye_outline from "./eye_outline.svg";
import arrow_right from "./arrow_right.svg";
import apple_solid from "./apple_solid.svg";
import card_credit from "./card_credit.svg";
import home_active from "./home_active.svg";
import barber_apron from "./barber_apron.png";
import social_apple from "./social_apple.svg";
import calendar_tick from "./calendar_tick.svg";
import social_google from "./social_google.svg";
import wallet_active from "./wallet_active.svg";
import fallback from "../images/placeholder.svg";
import profile_active from "./profile_active.svg";
import clock_outlined from "./clock_outlined.svg";
import electric_shaver from "./electric_shaver.png";
import social_facebook from "./social_facebook.svg";
import calendar_active from "./calendar_active.svg";
import arrow_line_left from "./arrow_line_left.svg";
import arrow_line_right from "./arrow_line_right.svg";
import star_solid_green from "./star_solid_green.svg";
import eye_slash_outline from "./eye_slash_outline.svg";
import arrow_circle_left from "./arrow_circle_left.svg";
import location_outlined from "./location_outlined.svg";
import calendar_solid_green from "./calendar_solid_green.svg";
import calendar_solid_white from "./calendar_solid_white.svg";
import clock_outlined_green from "./clock_outlined_green.svg";
import location_outlined_green from "./location_outlined_green.svg";

import lock from "./lock.svg";
import heart from "./heart.svg";
import logout from "./logout.svg";
import shield_done from "./shield_done.svg";
import notification from "./notification.svg";
import profile_custom from "./profile_custom.svg";
import timer from "./timer.svg";
import copy from "./copy.svg";
import check from "./check.svg";
import info from "./info.svg";
import refresh from "./refresh.svg";

export const icons = {
  pole,
  home,
  edit,
  trash,
  camera,
  wallet,
  barber,
  profile,
  fallback,
  calendar,
  card_add,
  pix_solid,
  trash_red,
  pole_left,
  user_edit,
  star_solid,
  pole_right,
  eye_outline,
  arrow_right,
  apple_solid,
  card_credit,
  home_active,
  barber_apron,
  social_apple,
  wallet_active,
  calendar_tick,
  social_google,
  clock_outlined,
  profile_active,
  electric_shaver,
  calendar_active,
  social_facebook,
  arrow_line_left,
  star_solid_green,
  arrow_line_right,
  eye_slash_outline,
  arrow_circle_left,
  location_outlined,
  clock_outlined_green,
  calendar_solid_green,
  calendar_solid_white,
  location_outlined_green,

  lock,
  heart,
  logout,
  shield_done,
  notification,
  profile_custom,
  timer,
  copy,
  check,
  info,
  refresh,
};

type IIcons = keyof typeof icons;

export const getIcons = (id: IIcons) => {
  return icons[id] ?? icons.fallback;
};
