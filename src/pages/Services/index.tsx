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
  const { services: selectedServices, toggleService } = useOrder();

  const { services, loading, error } = useServices();

  const isServiceSelected = (id: string): boolean =>
    selectedServices.some((service) => service.id === id);

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
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
                  tabIndex={0}
                  key={item.id}
                  role="button"
                  onClick={() => toggleService(item)}
                  onKeyDown={(e) => e.key === "Enter" && toggleService(item)}
                  className="btn size-auto bg-transparent border-0 shadow-none min-h-24 p-0"
                >
                  <Card
                    style={{
                      minWidth: "100%",
                      minHeight: "100%",
                    }}
                    className={cn(checked && "!bg-[#99B58E]")}
                  >
                    <div className="flex items-center w-full h-auto flex-1 relative">
                      {Boolean(item.desconto) && (
                        <div className="absolute -top-4 -right-4 bg-[#6C8762] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {item.desconto}%
                        </div>
                      )}

                      <CircleIcon className="!max-w-32 !max-h-32">
                        <img
                          src={item.imagem_url || getIcons("fallback")}
                          alt={`Service ${item.nome}`}
                          className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                        />
                      </CircleIcon>

                      <div className="flex flex-col justify-start items-start w-full h-auto gap-2 flex-grow pl-2">
                        <Title className="w-full text-start truncate max-w-[65%]">
                          {item.nome}
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
                          {item.duracao_minutos}min
                        </Text>

                        <div className="flex flex-col items-center gap-[5px] absolute right-2 bottom-2">
                          {Boolean(item.desconto) && (
                            <Text className="line-through">
                              {formatter({
                                type: "pt-BR",
                                currency: "BRL",
                                style: "currency",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                item.preco / (1 - (item?.desconto || 1) / 100)
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
                            }).format(item.preco || 0)}
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
                    (total, service) => total + service.preco,
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
