import { useNavigate } from "react-router-dom";

import { getIcons } from "@/assets/icons";
import { cn, formatter } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { useOrder } from "@/store/useOrderStore";
import { useServices } from "@/hooks/useServices";
import { Card, Header } from "@/components/organisms";
import {
  Text,
  Title,
  Button,
  Loading,
  CircleIcon,
} from "@/components/elements";

export const Services = () => {
  const navigate = useNavigate();
  const { services, loading, error, isLoading, setIsLoading } = useServices();
  const { services: selectedServices, toggleService } = useOrder();

  const isServiceSelected = (id: string): boolean =>
    selectedServices.some((service) => service.id === id);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    avatarUrl: string
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = avatarUrl;
    setIsLoading(false);
  };

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="alert alert-error">
        <span>Erro ao carregar serviços: {error}</span>
      </div>
    );

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Serviços"} backPath={"/"} />
        <div className="flex flex-col w-full justify-between items-start gap-2 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">
          <div className="grid grid-cols-1 gap-4 w-full max-w-full pb-[10px] pr-1">
            {services.map((item) => {
              const checked = isServiceSelected(item.id);
              return (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleService(item)}
                  onKeyDown={(e) => e.key === "Enter" && toggleService(item)}
                  className={cn(
                    "w-full h-auto bg-transparent border-0 shadow-none p-0",
                    "focus:outline-none cursor-pointer",
                    "transition-transform hover:scale-[1.005] active:scale-[0.98]"
                  )}
                  aria-label={`Select service ${item.name}`}
                >
                  <Card
                    style={{
                      minWidth: "100%",
                      minHeight: "100%",
                    }}
                    className={cn(checked && "!bg-[#99B58E]")}
                  >
                    <div className="flex items-center w-full h-auto flex-1 relative">
                      {Boolean(item.discount) && (
                        <div className="absolute -top-4 -right-4 bg-[#6C8762] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {item.discount}%
                        </div>
                      )}
                      <CircleIcon className="!max-w-32 !max-h-32">
                        {isLoading && (
                          <div className="size-full flex items-center justify-center">
                            <div className="loading loading-spinner text-white"></div>
                          </div>
                        )}

                        <img
                          onLoad={handleImageLoad}
                          alt={`Service ${item.name}`}
                          src={item.imageUrl || getIcons("fallback")}
                          onError={(e) => handleImageError(e, item.imageUrl)}
                          className={cn(
                            "w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover",
                            isLoading && "hidden"
                          )}
                        />
                      </CircleIcon>

                      <div className="flex flex-col justify-start items-start w-full h-auto gap-2 flex-grow pl-2">
                        <Title className="w-full text-start truncate max-w-[65%]">
                          {item.name}
                        </Title>

                        <Text
                          className={cn(
                            "flex items-center gap-[5px] truncate max-w-[calc(100% - 25px)]",
                            checked && "text-[#111827]"
                          )}
                        >
                          <img
                            alt="Icon clock"
                            className={cn(
                              "size-5",
                              checked && "brightness-[0.65]"
                            )}
                            src={getIcons("clock_outlined_green")}
                          />
                          <div
                            className={cn(
                              "h-2.5 rounded-2xl w-[0.8px] bg-[#6B7280]",
                              checked && "bg-[#111827]"
                            )}
                          />
                          {item.durationMinutes}min
                        </Text>

                        <div className="flex flex-col items-center gap-[5px] absolute right-2 bottom-2">
                          {Boolean(item.discount) && (
                            <Text className="line-through">
                              {formatter({
                                type: "pt-BR",
                                currency: "BRL",
                                style: "currency",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                item.price / (1 - (item?.discount || 1) / 100)
                              )}
                            </Text>
                          )}
                          <Title className="textarea-md font-[300]">
                            {formatter({
                              type: "pt-BR",
                              currency: "BRL",
                              style: "currency",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(item.price || 0)}
                          </Title>
                        </div>
                      </div>

                      <input
                        readOnly
                        type="checkbox"
                        name="rememberMe"
                        checked={checked}
                        className={cn(
                          "absolute top-[7px] right-[5px] self-stretch checkbox custom_before_service w-4 h-4 border border-[#6b7280] p-[3px] rounded-3xl !shadow-none",
                          checked && "border-[#111827] brightness-[0.65]"
                        )}
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            className="bottom-0 sticky max-w-80 m-auto h-14"
            disabled={!selectedServices.length}
            onClick={() => navigate("/barbers")}
          >
            {selectedServices.length
              ? `Confirmar • ${formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(
                  selectedServices.reduce(
                    (total, service) => total + service.price,
                    0
                  )
                )}`
              : "Confirmar"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};
