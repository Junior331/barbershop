export const detectPlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
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
