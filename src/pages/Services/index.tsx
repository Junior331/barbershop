import { useNavigate } from "react-router-dom";

import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { useServices } from "@/hooks/useServices";
import { Card, Header } from "@/components/organisms";
import { useOrder, useOrderActions } from "@/store/useOrderStore";
import { Button, CircleIcon, Loading, Text, Title } from "@/components/elements";

export const Services = () => {
  const navigate = useNavigate();
  const { toggleService } = useOrderActions();
  const { services: selectedServices } = useOrder();

  const { services, loading, error } = useServices();

  const isServiceSelected = (id: number): boolean =>
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
                  >
                    <div className="flex items-center w-full h-auto flex-1 relative">
                      {Boolean(item.discount) && (
                        <div className="absolute -top-4 -right-4 bg-[#6C8762] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {item.discount}%
                        </div>
                      )}

                      <CircleIcon className="!max-w-32 !max-h-32">
                        <img
                          src={item.icon}
                          alt={`Service ${item.name}`}
                          className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                        />
                      </CircleIcon>

                      <div className="flex flex-col justify-start items-start w-full h-auto gap-2 flex-grow pl-2">
                        <Title className="w-full text-start truncate max-w-[65%]">
                          {item.name}
                        </Title>

                        <Text className="flex items-center gap-[5px] truncate max-w-[calc(100% - 25px)]">
                          <img
                            alt="Icon clock"
                            className="size-5"
                            src={getIcons("clock_outlined_green")}
                          />
                          <div className="h-2.5 rounded-2xl w-[0.8px] bg-[#6B7280] " />
                          {item.time}min
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
                        className="absolute top-[7px] right-[5px] self-stretch checkbox custom_before_service w-4 h-4 border border-[#6b7280] p-[3px] rounded-3xl !shadow-none"
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            disabled={!selectedServices.length}
            onClick={() => navigate("/barbers")}
          >
            {/* {selectedServices.length
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
              : "Confirmar"} */}
            Confirmar
          </Button>
        </div>
      </div>
    </Layout>
  );
};
