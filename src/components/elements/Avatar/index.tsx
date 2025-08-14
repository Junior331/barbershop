import { useState } from "react";

import { CircleIcon } from "../CircleIcon";
import { useAvatar } from "@/hooks/useAvatar";
import { useAuth } from "@/context/AuthContext";

export const Avatar = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const displayName = user?.name || user?.email?.split("@")[0] || "?";
  const avatarUrl = useAvatar(displayName, {
    size: 69,
    rounded: true,
    backgroundColors: ["#FF5733", "#3357FF", "#33FF57"],
  });

  console.log(`user 22 ::`, user)


  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = avatarUrl;
    setIsLoading(false);
  };

  return (
    <CircleIcon className="bg-transparent">
      {isLoading && (
        <div className="size-full flex items-center justify-center">
          <div className="loading loading-spinner text-primary"></div>
        </div>
      )}
      <img
        className={`size-full object-cover ${isLoading ? 'hidden' : ''}`}
        alt={`Avatar de ${displayName}`}
        src={user?.avatarUrl || avatarUrl}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </CircleIcon>
  );
};