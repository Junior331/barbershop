import { cn } from "@/utils/utils";
import { AdaptedBarber } from "@/hooks/useBarbers";
import { Card } from "@/components/organisms";
import { CircleIcon, Text, Title } from "@/components/elements";
import { getIcons } from "@/assets/icons";

interface BarberCardProps {
  barber: AdaptedBarber;
  isSelected: boolean;
  onSelect: (barber: AdaptedBarber) => void;
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

  const totalAppointments = barber.barber_details.barber_rating > 0 ?
    Math.floor(barber.barber_details.barber_rating * 20) : 0; // Estimativa baseada no rating

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
              src={
                barber.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=6C8762&color=fff&size=96`
              }
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=6C8762&color=fff&size=96`;
              }}
            />
          </CircleIcon>

          <div className="flex flex-col justify-start items-start w-full gap-1 flex-grow">
            <Title className="w-full text-start leading-tight truncate">
              {barber.name}
            </Title>

            <div className="flex items-center gap-2 mb-1">
              <Text
                className={cn(
                  "flex items-center text-yellow-500 text-sm",
                  isSelected && "text-[#111827]"
                )}
              >
                <img
                  src={getIcons("star_solid_green")}
                  alt="Rating"
                  className="size-4 mr-1"
                />
                {barber.barber_details.barber_rating?.toFixed(1) ?? "0.0"}
              </Text>
              <div className="h-3 w-px bg-gray-300" />
              <Text
                className={cn(
                  "text-xs text-gray-500",
                  isSelected && "text-[#111827]"
                )}
              >
                {totalAppointments} cortes
              </Text>
            </div>

            {barber.services.length > 0 && (
              <div
                className={cn(
                  "text-xs text-gray-400 mt-1 line-clamp-2",
                  isSelected && "text-[#111827]"
                )}
              >
                <span className="font-medium">Serviços:</span> {barber.services.join(", ")}
              </div>
            )}

            {barber.total_price > 0 && (
              <div
                className={cn(
                  "text-sm font-medium text-green-600 mt-1",
                  isSelected && "text-[#111827]"
                )}
              >
                Total: R$ {barber.total_price.toFixed(2)}
              </div>
            )}
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
