import { getImage } from "@/assets/images";
import { getServices } from "@/assets/services";
// import { BarberSchedule, BarberType } from "@/utils/types";

export const promotionsWeek = [
  {
    id: 1,
    price: 40,
    name: "Barba e Cabelo",
    icon: getServices("beard_hair"),
  },
  {
    id: 2,
    price: 35,
    name: "Barba",
    icon: getServices("beard"),
  },
  {
    id: 3,
    price: 25,
    name: "Corte com Máquina",
    icon: getServices("electric_razor_cut"),
  },
  {
    id: 4,
    price: 28,
    name: "Corte com Tesoura",
    icon: getServices("scissor_cut"),
  },
  {
    id: 5,
    price: 35,
    name: "Reflexo",
    icon: getServices("reflex"),
  },
  {
    id: 6,
    price: 40,
    name: "Pigmentação",
    icon: getServices("pigmentation"),
  },
  {
    id: 7,
    price: 40,
    name: "Cortes Infantis",
    icon: getServices("kids_cuts"),
  },
  {
    id: 8,
    price: 8,
    name: "Cortes de Cabelo",
    icon: getServices("haircuts"),
  },
  {
    id: 9,
    price: 8,
    name: "Sobrancelha",
    icon: getServices("eyebrow"),
  },
];

export const orders = [
  {
    id: 1,
    time: 40,
    name: "Barba e Cabelo",
    barber: "Breno Tavares",
    icon: getServices("beard_hair"),
    location: "Barbearia faz milagres",
  },
  {
    id: 2,
    time: 20,
    name: "Barba",
    barber: "Breno Tavares",
    icon: getServices("beard"),
    location: "Barbearia faz milagres",
  },
  {
    id: 3,
    time: 25,
    name: "Corte com Máquina",
    barber: "Breno Tavares",
    icon: getServices("electric_razor_cut"),
    location: "Barbearia faz milagres",
  },
  {
    id: 4,
    time: 28,
    name: "Corte com Tesoura",
    barber: "Jaja",
    icon: getServices("scissor_cut"),
    location: "Barbearia faz milagres",
  },
  {
    id: 5,
    time: 35,
    name: "Reflexo",
    barber: "Breno Tavares",
    icon: getServices("reflex"),
    location: "Barbearia faz milagres",
  },
  {
    id: 6,
    time: 40,
    name: "Pigmentação",
    barber: "Angelo Lima",
    icon: getServices("pigmentation"),
    location: "Barbearia faz milagres",
  },
  {
    id: 7,
    time: 40,
    name: "Cortes Infantis",
    barber: "Joao Pedro",
    icon: getServices("kids_cuts"),
    location: "Barbearia faz milagres",
  },
  {
    id: 8,
    time: 8,
    name: "Cortes de Cabelo",
    barber: "Danyel Coelho",
    icon: getServices("haircuts"),
    location: "Barbearia faz milagres",
  },
  {
    id: 9,
    time: 8,
    name: "Sobrancelha",
    barber: "Breno Tavares",
    icon: getServices("eyebrow"),
    location: "Barbearia faz milagres",
  },
];

const defaultSchedule: any[] = [
  { weekday: 1, startTime: "08:00", endTime: "18:00" }, // segunda
  { weekday: 2, startTime: "08:00", endTime: "18:00" },
  { weekday: 3, startTime: "08:00", endTime: "18:00" },
  { weekday: 4, startTime: "08:00", endTime: "18:00" },
  { weekday: 5, startTime: "08:00", endTime: "18:00" },
  { weekday: 6, startTime: "08:00", endTime: "14:00" }, // sábado
];

export const barbers: any[] = [
  {
    id: "1",
    cuts: 1872,
    rating: 4.8,
    type: "Barbeiro",
    name: "Willian",
    image: getImage("willian"),
    location: "Barbearia faz milagres",
    schedule: defaultSchedule,
  },
  {
    id: "2",
    cuts: 1872,
    rating: 4.8,
    type: "Barbeiro",
    name: "Breno Tavares",
    image: getImage("breno_tavares"),
    location: "Barbearia faz milagres",
    schedule: defaultSchedule,
  },
  {
    id: "3",
    cuts: 1872,
    rating: 4.8,
    type: "Barbeiro",
    name: "Angelo lima",
    image: getImage("angelo_lima"),
    location: "Barbearia faz milagres",
    schedule: defaultSchedule,
  },
  {
    id: "4",
    cuts: 1872,
    rating: 4.8,
    type: "Barbeiro",
    name: "Danyel coelho",
    image: getImage("danyel_coelho"),
    location: "Barbearia faz milagres",
    schedule: defaultSchedule,
  },
  {
    id: "5",
    cuts: 1872,
    rating: 4.8,
    type: "Barbeiro",
    name: "Joao pedro",
    image: getImage("joao_pedro"),
    location: "Barbearia faz milagres",
    schedule: defaultSchedule,
  },
  {
    id: "6",
    cuts: 1872,
    rating: 4.8,
    type: "Barbeiro",
    name: "Jaja",
    image: getImage("Jaja"),
    location: "Barbearia faz milagres",
    schedule: defaultSchedule,
  },
];
