import { service } from "@/utils/types";
import { getServices } from "@/assets/services";

// Função para gerar uma data aleatória no formato ISO
export const generateRandomDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Gera horas, minutos, segundos e milissegundos aleatórios
  const hours = Math.floor(Math.random() * 24); // 0-23
  const minutes = Math.floor(Math.random() * 60); // 0-59
  const seconds = Math.floor(Math.random() * 60); // 0-59
  const milliseconds = Math.floor(Math.random() * 1000); // 0-999
  date.setHours(hours, minutes, seconds, milliseconds);
  return date.toISOString();
};

export const orders: service[] = [
  {
    id: 1,
    time: 40,
    price: 40,
    date: generateRandomDate("2025-03-16"),
    status: "pending",
    name: "Beard & hair",
    barber: "Breno Tavares",
    icon: getServices("beard_hair"),
    location: "Barbearia faz milagres",
  },
  {
    id: 2,
    time: 20,
    price: 20,
    date: generateRandomDate("2025-03-20"),
    status: "pending",
    name: "Beard",
    barber: "Breno Tavares",
    icon: getServices("beard"),
    location: "Barbearia faz milagres",
  },
  {
    id: 3,
    time: 25,
    price: 25,
    date: generateRandomDate("2025-03-12"),
    status: "completed",
    name: "Hair",
    barber: "Breno Tavares",
    icon: getServices("electric_razor_cut"),
    location: "Barbearia faz milagres",
  },
  {
    id: 4,
    time: 28,
    price: 28,
    date: generateRandomDate("2025-03-12"),
    status: "completed",
    name: "Scissor Cut",
    barber: "Jaja",
    icon: getServices("scissor_cut"),
    location: "Barbearia faz milagres",
  },
  {
    id: 5,
    time: 35,
    price: 35,
    date: generateRandomDate("2025-03-12"),
    status: "completed",
    name: "Reflex",
    barber: "Breno Tavares",
    icon: getServices("reflex"),
    location: "Barbearia faz milagres",
  },
  {
    id: 6,
    time: 40,
    price: 40,
    date: generateRandomDate("2025-03-12"),
    status: "completed",
    name: "Pigmentation",
    barber: "Angelo Lima",
    icon: getServices("pigmentation"),
    location: "Barbearia faz milagres",
  },
  {
    id: 7,
    time: 40,
    price: 40,
    date: generateRandomDate("2025-03-12"),
    status: "completed",
    name: "Kids' cuts",
    barber: "Joao Pedro",
    icon: getServices("kids_cuts"),
    location: "Barbearia faz milagres",
  },
  {
    id: 8,
    time: 8,
    price: 8,
    date: generateRandomDate("2025-03-12"),
    status: "completed",
    name: "Hair cuts",
    barber: "Danyel Coelho",
    icon: getServices("haircuts"),
    location: "Barbearia faz milagres",
  },
  {
    id: 9,
    time: 8,
    price: 8,
    date: generateRandomDate("2025-03-12"),
    status: "completed",
    name: "Eyebrow",
    barber: "Breno Tavares",
    icon: getServices("eyebrow"),
    location: "Barbearia faz milagres",
  },
];