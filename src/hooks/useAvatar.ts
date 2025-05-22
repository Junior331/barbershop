import { useMemo } from "react";

import { UseAvatarOptions } from "@/utils/types";
import { DEFAULT_COLORS } from "@/utils/emptys";
import { getContrastColor } from "@/utils/utils";

export const useAvatar = (name: string, options: UseAvatarOptions = {}) => {
  const {
    size = 100,
    backgroundColors = DEFAULT_COLORS,
    textColor = "auto",
    rounded = true,
  } = options;

  const avatarSvg = useMemo(() => {
    const normalizedName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    // Extrai as iniciais
    let initials = '';
    
    // Se contém espaços (nome composto)
    if (normalizedName.includes(' ')) {
      initials = normalizedName
        .split(/\s+/)
        .map(part => part[0])
        .join('')
        .substring(0, 2);
    } else {
      // Para nomes sem espaços, pega as duas primeiras letras
      initials = normalizedName.substring(0, 2);
    }

    initials = initials.toUpperCase();

    const hash = Array.from(name).reduce(
      (acc, char) => char.charCodeAt(0) + acc,
      0
    );
    const bgColor = backgroundColors[hash % backgroundColors.length];

    const txtColor =
      textColor === "auto" ? getContrastColor(bgColor) : textColor;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${bgColor}" ${rounded ? `rx="${size / 2}"` : ''}/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.4}" 
            fill="${txtColor}" text-anchor="middle" dominant-baseline="middle">
        ${initials}
      </text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  }, [name, size, backgroundColors, textColor, rounded]);

  return avatarSvg;
};
