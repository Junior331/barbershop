import { getServices } from "@/assets/services";
import { Service } from "@/utils/types";

export const services: Service[] = [
  {
    id: 1,
    time: 40,
    price: 40,
    name: "Barba e Cabelo",
    icon: getServices("beard_hair"),
  },
  {
    id: 2,
    time: 40,
    price: 35,
    name: "Barba",
    icon: getServices("beard"),
  },
  {
    id: 3,
    time: 40,
    price: 25,
    name: "Corte com Máquina",
    icon: getServices("electric_razor_cut"),
  },
  {
    id: 4,
    time: 40,
    price: 28,
    name: "Corte com Tesoura",
    icon: getServices("scissor_cut"),
  },
  {
    id: 5,
    time: 40,
    price: 35,
    name: "Reflexo",
    icon: getServices("reflex"),
  },
  {
    id: 6,
    time: 40,
    price: 40,
    name: "Pigmentação",
    icon: getServices("pigmentation"),
  },
  {
    id: 7,
    time: 40,
    price: 40,
    name: "Cortes Infantis",
    icon: getServices("kids_cuts"),
  },
  {
    id: 8,
    time: 40,
    price: 8,
    name: "Cortes de Cabelo",
    icon: getServices("haircuts"),
  },
  {
    id: 9,
    time: 40,
    price: 8,
    name: "Sobrancelha",
    icon: getServices("eyebrow"),
  },
];
