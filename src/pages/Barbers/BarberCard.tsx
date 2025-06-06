import { cn } from "@/utils/utils";
import { IBarber } from "@/utils/types";
import { Card } from "@/components/organisms";
import { CircleIcon, Text, Title } from "@/components/elements";

interface BarberCardProps {
  barber: IBarber;
  isSelected: boolean;
  onSelect: (barber: IBarber) => void;
}

export const BarberCard = ({
  barber,
  isSelected,
  onSelect,
}: BarberCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      onSelect(barber);
    }
  };

  console.log(`barber ::`, barber);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(barber)}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full h-auto bg-transparent border-0 shadow-none p-0",
        "focus:outline-none cursor-pointer",
        "transition-transform hover:scale-[1.005] active:scale-[0.98]"
      )}
      aria-label={`Select barber ${barber.name}`}
    >
      <Card className={cn(isSelected && "!bg-[#99B58E]")}>
        <div className="flex items-center w-full h-full px-3 min-h-28 my-auto relative gap-3">
          <CircleIcon className="min-w-24 h-24 my-auto overflow-hidden shrink-0">
            <img
              loading="lazy"
              alt={`Barber ${barber.name}`}
              className="w-full h-full object-cover"
              src={barber.avatar_url || "/default-avatar.png"}
            />
          </CircleIcon>

          <div className="flex flex-col justify-start items-start w-full gap-1 flex-grow">
            <Title className="w-full text-start leading-tight truncate">
              {barber.name}
            </Title>

            <Text className={cn("text-xs", isSelected && "text-[#111827]")}>
              {barber.barber_details.description}
            </Text>

            {barber.services.length > 0 && (
              <div
                className={cn(
                  "text-xs text-gray-400 mt-1 line-clamp-1",
                  isSelected && "text-[#111827]"
                )}
              >
                Oferece: {barber.services.map((service) => service).join(", ")}
              </div>
            )}

            <Text
              className={cn(
                "flex items-center text-yellow-500 text-sm",
                isSelected && "text-[#111827]"
              )}
            >
              ★ {barber.barber_details.barber_rating?.toFixed(1) ?? "0.0"}
            </Text>
          </div>

          <input
            readOnly
            type="checkbox"
            checked={isSelected}
            className={cn(
              "absolute top-[7px] right-[5px] self-stretch checkbox custom_before_service w-4 h-4 border border-[#6b7280] p-[3px] rounded-3xl !shadow-none",
              isSelected && "border-[#111827] brightness-[0.65]"
            )}
          />

          {/* <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className={cn(
              "checkbox w-4 h-4 border border-gray-500 p-[3px] rounded-full",
              "absolute top-3 right-3 cursor-pointer",
              "focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            )}
          /> */}
        </div>
      </Card>
    </div>
  );
};
