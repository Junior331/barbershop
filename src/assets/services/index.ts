import beard from "./beard.svg";
import reflex from "./reflex.svg";
import eyebrow from "./eyebrow.svg";
import haircuts from "./haircuts.svg";
import kids_cuts from "./kids_cuts.svg";
import beard_hair from "./beard_hair.svg";
import scissor_cut from "./scissor_cut.svg";
import pigmentation from "./pigmentation.svg";
import fallback from "../images/placeholder.svg";
import electric_razor_cut from "./electric_razor_cut.svg";


export const services = {
  beard,
  reflex,
  fallback,
  eyebrow,
  haircuts,
  kids_cuts,
  beard_hair,
  scissor_cut,
  pigmentation,
  electric_razor_cut,
};

type IServices = keyof typeof services;

export const getServices = (id: IServices) => {
  return services[id] ?? services.fallback;
};
