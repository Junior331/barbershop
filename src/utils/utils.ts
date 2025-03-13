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
