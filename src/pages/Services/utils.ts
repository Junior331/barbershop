import { getServices } from "@/assets/services";
import { IService } from "@/utils/types";

export const services: IService[] = [
  {
    id: 1,
    time: 40,
    price: 40,
    discount: 0,
    public: true,
    name: "Barba e Cabelo",
    icon: getServices("beard_hair"),
    created_at: ""
  },
  {
    id: 2,
    time: 40,
    price: 35,
    discount: 0,
    public: true,
    name: "Barba",
    icon: getServices("beard"),
    created_at: ""
  },
  {
    id: 3,
    time: 40,
    price: 25,
    discount: 0,
    public: true,
    name: "Corte com Máquina",
    icon: getServices("electric_razor_cut"),
    created_at: ""
  },
  {
    id: 4,
    time: 40,
    price: 28,
    discount: 0,
    public: true,
    name: "Corte com Tesoura",
    icon: getServices("scissor_cut"),
    created_at: ""
  },
  {
    id: 5,
    time: 40,
    price: 35,
    discount: 0,
    public: true,
    name: "Reflexo",
    icon: getServices("reflex"),
    created_at: ""
  },
  {
    id: 6,
    time: 40,
    price: 40,
    discount: 0,
    public: true,
    name: "Pigmentação",
    icon: getServices("pigmentation"),
    created_at: ""
  },
  {
    id: 7,
    time: 40,
    price: 40,
    discount: 0,
    public: true,
    name: "Cortes Infantis",
    icon: getServices("kids_cuts"),
    created_at: ""
  },
  {
    id: 8,
    time: 40,
    price: 8,
    discount: 0,
    public: true,
    name: "Cortes de Cabelo",
    icon: getServices("haircuts"),
    created_at: ""
  },
  {
    id: 9,
    time: 40,
    price: 8,
    discount: 0,
    public: true,
    name: "Sobrancelha",
    icon: getServices("eyebrow"),
    created_at: ""
  },
];
