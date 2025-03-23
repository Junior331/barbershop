import { formatterProps } from "./types";

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

// export const maskPhone = (value: string) =>
//   value.replace(/(\d{2})(\d{5})(\d{4})/g, "($1) $2-$3");

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
  
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${formattedDate} as ${formattedTime}`;
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value);
};