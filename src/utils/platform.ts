/* eslint-disable @typescript-eslint/no-explicit-any */
export const detectPlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return "ios";
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return "android";
  }

  // Default to web
  return "web";
};

export const isIOS = () => detectPlatform() === "ios";
export const isAndroid = () => detectPlatform() === "android";
