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
