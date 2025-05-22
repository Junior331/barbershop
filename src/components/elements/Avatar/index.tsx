import { CircleIcon } from "../CircleIcon";
import { useAvatar } from "@/hooks/useAvatar";
import { useAuth } from "@/context/AuthContext";

export const Avatar = () => {
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "U";
  const avatarUrl = useAvatar(displayName, {
    size: 69,
    rounded: true,
    backgroundColors: ["#FF5733", "#3357FF", "#33FF57"],
  });

  return (
    <CircleIcon className="bg-transparent">
      <img
        className="h-full"
        alt={`Avatar de ${displayName}`}
        src={user?.user_metadata?.avatar_url || avatarUrl}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = avatarUrl;
          target.onerror = null;
        }}
      />
    </CircleIcon>
  );
};
