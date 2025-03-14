import Jaja from "./Jaja.jpg";
import logo from "./logo.svg";
import willian from "./willian.png";
import fallback from "./placeholder.svg";
import joao_pedro from "./joao_pedro.jpg";
import angelo_lima from "./angelo_lima.jpg";
import breno_tavares from "./breno_tavares.jpg";
import danyel_coelho from "./danyel_coelho.jpg";
import barber_avatar from "./barber_avatar.svg";

export const images = {
  Jaja,
  logo,
  willian,
  fallback,
  joao_pedro,
  angelo_lima,
  breno_tavares,
  danyel_coelho,
  barber_avatar,
};

type IImage = keyof typeof images;

export const getImage = (id: IImage) => {
  return images[id] ?? images.fallback;
};
