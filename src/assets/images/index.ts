import logo from "./logo.svg";
import fallback from "./placeholder.svg";

export const images = {
  logo,
  fallback,
};

type IImage = keyof typeof images;

export const getImage = (id: IImage) => {
  return images[id] ?? images.fallback;
};
