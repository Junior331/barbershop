import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { cn, formatter } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import {
  Text,
  Title,
  Button,
  Loading,
  CircleIcon,
} from "@/components/elements";

// Services
import { servicesService } from "@/services";
import type { Service } from "@/services";
import { useOrder } from "@/store/useOrderStore";


export const Services = () => {
  const navigate = useNavigate();

  // Estados
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const {toggleService, services: selectedServices} = useOrder();

  // Carregar serviços
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await servicesService.getForSelection();
        setServices(data);

        // Inicializar estados de loading das imagens
        const initialStates: Record<string, boolean> = {};
        data.forEach(service => {
          initialStates[service.id] = true;
        });
        setImageLoadingStates(initialStates);

      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        toast.error('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Verificar se serviço está selecionado
  const isServiceSelected = (id: string): boolean =>
    selectedServices.some(service => service.id === id);

  // Handlers para imagens
  const handleImageLoad = (serviceId: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [serviceId]: false
    }));
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    serviceId: string
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = getIcons("fallback");
    setImageLoadingStates(prev => ({
      ...prev,
      [serviceId]: false
    }));
  };

  // Calcular total com desconto
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + service.pricing.finalPrice;
    }, 0);
  };

  const calculateOriginalTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + service.pricing.originalPrice;
    }, 0);
  };

  const hasDiscount = selectedServices.some(service => service.pricing.hasDiscount);
  const totalDiscount = calculateOriginalTotal() - calculateTotal();

  // Handler para prosseguir
  const handleContinue = () => {
    if (selectedServices.length === 0) return;

    // Salvar no localStorage ou store global
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    navigate("/barbers");
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Selecione os Serviços"} backPath={"/"} />

        <div className="flex flex-col w-full justify-between items-start gap-2 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">

          {/* Lista de Serviços */}
          <div className="grid grid-cols-1 gap-4 w-full max-w-full pb-[10px] pr-1">
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Text className="text-gray-500">Nenhum serviço disponível</Text>
              </div>
            ) : (
              services.map((service) => {
                const checked = isServiceSelected(service.id);
                const isImageLoading = imageLoadingStates[service.id];
                return (
                  <div
                    key={service.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleService(service)}
                    onKeyDown={(e) => e.key === "Enter" && toggleService(service)}
                    className={cn(
                      "w-full h-auto bg-transparent border-0 shadow-none p-0",
                      "focus:outline-none cursor-pointer",
                      "transition-transform hover:scale-[1.005] active:scale-[0.98]"
                    )}
                    aria-label={`Select service ${service.name}`}
                  >
                    <Card
                      style={{
                        minWidth: "100%",
                        minHeight: "100%",
                      }}
                      className={cn(checked && "!bg-[#99B58E]")}
                    >
                      <div className="flex items-center w-full h-auto flex-1 relative">

                        {/* Badge de desconto */}
                        {service.pricing.hasDiscount && (
                          <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                            -{service.pricing.discountPercentage}%
                          </div>
                        )}

                        {/* Imagem do serviço */}
                        <CircleIcon className="!max-w-32 !max-h-32">
                          {isImageLoading && (
                            <div className="size-full flex items-center justify-center">
                              <div className="loading loading-spinner text-white"></div>
                            </div>
                          )}

                          <img
                            onLoad={() => handleImageLoad(service.id)}
                            alt={`Service ${service.name}`}
                            src={service.imageUrl || getIcons("fallback")}
                            onError={(e) => handleImageError(e, service.id)}
                            className={cn(
                              "w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover",
                              isImageLoading && "hidden"
                            )}
                          />
                        </CircleIcon>

                        {/* Informações do serviço */}
                        <div className="flex flex-col justify-start items-start w-full h-auto gap-2 flex-grow pl-2">
                          <Title className="w-full text-start truncate max-w-[65%]">
                            {service.name}
                          </Title>

                          {/* Descrição (se disponível) */}
                          {service.description && (
                            <Text className={cn(
                              "text-sm text-gray-600 truncate max-w-[calc(100% - 25px)]",
                              checked && "text-[#111827]"
                            )}>
                              {service.description}
                            </Text>
                          )}

                          {/* Duração */}
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
                            {service.durationMinutes}min
                          </Text>

                          {/* Número de barbeiros disponíveis */}
                          <Text className={cn(
                            "text-xs text-gray-500",
                            checked && "text-[#111827]"
                          )}>
                            {service.barbersCount} barbeiro{service.barbersCount > 1 ? 's' : ''} disponíve{service.barbersCount !== 1 ? 'is' : 'l'}
                          </Text>

                          {/* Promoção ativa (se houver) */}
                          {/* {service.promotion && (
                            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded max-w-[calc(100% - 25px)]">
                              🎉 {service.promotion.title}
                            </div>
                          )} */}
                        </div>

                        {/* Preços */}
                        <div className="flex flex-col items-end gap-[5px] absolute right-2 bottom-2">
                          {service.pricing.hasDiscount && (
                            <Text className="line-through text-gray-400 text-sm">
                              {formatter({
                                type: "pt-BR",
                                currency: "BRL",
                                style: "currency",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(service.pricing.originalPrice)}
                            </Text>
                          )}
                          <Title className={cn(
                            "textarea-md font-[500]",
                            service.pricing.hasDiscount && "text-green-600"
                          )}>
                            {formatter({
                              type: "pt-BR",
                              currency: "BRL",
                              style: "currency",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(service.pricing.finalPrice)}
                          </Title>
                        </div>

                        {/* Checkbox */}
                        <input
                          readOnly
                          type="checkbox"
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
              })
            )}
          </div>

          <div className="bottom-0 sticky w-auto m-auto">
            {selectedServices.length > 0 && hasDiscount && (
              <div className="flex justify-between items-center mb-2 px-2">
                <Text className="text-sm text-gray-600">
                  Economia total:
                </Text>
                <Text className="text-sm font-semibold text-green-600">
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(totalDiscount)}
                </Text>
              </div>
            )}

            <Button
              type="button"
              className="max-w-80 m-auto h-14 w-full"
              disabled={!selectedServices.length}
              onClick={handleContinue}
            >
              {selectedServices.length
                ? `Continuar • ${formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(calculateTotal())}`
                : "Selecione pelo menos um serviço"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};