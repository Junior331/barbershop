import { twMerge } from "tailwind-merge";
import { formatterProps } from "./types";
import { clsx, type ClassValue } from "clsx";

export const formatter = ({
  currency,
  type = "en-US",
  style = "decimal",
  minimumFractionDigits,
  maximumFractionDigits,
}: formatterProps) => {
  return new Intl.NumberFormat(type, {
    style,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

export const relativeTimeAgo = (timestamp: number) => {
  const date = new Date();
  const timeNow = date.getTime();
  const seconds = Math.floor(timeNow / 1000);
  const difference = seconds - timestamp;
  let output = ``;
  if (difference < 60) {
    // Less than a minute has passed:
    output = `${difference} sec ago`;
  } else if (difference < 3600) {
    output = `${Math.floor(difference / 60)} min ago`;
  } else if (difference < 86400) {
    output = `${Math.floor(difference / 3600)} hour ago`;
  } else if (difference < 2620800) {
    output = `${Math.floor(difference / 86400)} days ago`;
  } else if (difference < 31449600) {
    output = `${Math.floor(difference / 2620800)} months ago`;
  } else {
    output = `${Math.floor(difference / 31449600)} years ago`;
  }
  return output;
};

export const convertSecondsToDays = (seconds: number): number => {
  const secondsInADay = 86400;
  return Math.floor(seconds / secondsInADay);
};

export const formatDateTime = (dateString: string, type: "date" | "time") => {
  const date = new Date(dateString);

  if (type === "date") {
    return date.toLocaleDateString("en-US");
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const maskPhone = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);

export const maskBirthday = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .slice(0, 10);

export const maskZipCode = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);

export const getCurrentDate = (): {
  dayOfWeek: string;
  formattedDate: string;
} => {
  const date = new Date();

  const rawDayOfWeek = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(date);

  const rawFormattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(date);

  const dayOfWeek =
    rawDayOfWeek.charAt(0).toUpperCase() + rawDayOfWeek.slice(1);

  // Capitalizar mês
  const formattedDate = rawFormattedDate.replace(
    /(\d{2}) de (\w+)/,
    (_, day, month) =>
      `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
  );

  return { dayOfWeek, formattedDate };
};

export const formatCustomDateTime = (isoString: string): string => {
  const date = new Date(isoString);

  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} às ${formattedTime}`;
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

export const getContrastColor = (hexColor: string) => {
  // Converte hex para RGB
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  // Calcula luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

export const convertToDateObject = (dateString: string): Date | null => {
  if (!dateString) return null;

  const [day, month, year] = dateString.split("/");
  if (!day || !month || !year) return null;

  // Cria uma data no formato AAAA-MM-DD
  return new Date(`${year}-${month}-${day}`);
};

export const formatDateForSupabase = (dateString: string): string | null => {
  const date = convertToDateObject(dateString);
  if (!date) return null;

  // Formata para AAAA-MM-DD
  return date.toISOString().split("T")[0];
};

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const detectCardBrand = (cardNumber: string): string => {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^5[1-5]/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "American Express";
  return "Other";
};
