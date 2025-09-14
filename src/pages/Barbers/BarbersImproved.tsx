import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

import { barbersService } from "@/services";
import type { Barber, Service } from "@/services";

interface SelectedService extends Service {
  selectedBarbers?: string[];
}

export const BarbersImproved = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const servicesFromStorage = localStorage.getItem('selectedServices');
    if (servicesFromStorage) {
      setSelectedServices(JSON.parse(servicesFromStorage));
    } else {
      toast.error('Nenhum serviço selecionado');
      navigate('/services');
      return;
    }

    const loadBarbers = async () => {
      try {
        setLoading(true);
        const services = JSON.parse(servicesFromStorage || '[]');
        const serviceIds = services.map((service: Service) => service.id);

        const data = await barbersService.getByServices(serviceIds);
        setBarbers(data);

        const initialStates: Record<string, boolean> = {};
        data.forEach(barber => {
          initialStates[barber.id] = true;
        });
        setImageLoadingStates(initialStates);

      } catch (error) {
        console.error('Erro ao carregar barbeiros:', error);
        toast.error('Erro ao carregar barbeiros');
      } finally {
        setLoading(false);
      }
    };

    loadBarbers();
  }, [navigate]);

  const toggleBarber = (barberId: string) => {
    setSelectedBarbers(prev => {
      const isSelected = prev.includes(barberId);

      if (isSelected) {
        return prev.filter(id => id !== barberId);
      } else {
        return [...prev, barberId];
      }
    });
  };

  const isBarberSelected = (id: string): boolean =>
    selectedBarbers.includes(id);

  const handleImageLoad = (barberId: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [barberId]: false
    }));
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    barberId: string
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = getIcons("fallback");
    setImageLoadingStates(prev => ({
      ...prev,
      [barberId]: false
    }));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + service.pricing.finalPrice;
    }, 0);
  };

  const handleContinue = () => {
    if (selectedBarbers.length === 0) {
      toast.error('Selecione pelo menos um barbeiro');
      return;
    }

    const bookingData = {
      selectedServices,
      selectedBarbers,
      totalPrice: calculateTotal()
    };

    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate("/schedule");
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Selecione o(s) Barbeiro(s)" backPath="/services" />

        <div className="flex flex-col w-full justify-between items-start gap-2 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">

          {/* Resumo dos serviços selecionados */}
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
            <Title className="mb-2 text-sm">Serviços selecionados:</Title>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map(service => (
                <div
                  key={service.id}
                  className="bg-[#6C8762] text-white px-3 py-1 rounded-full text-xs"
                >
                  {service.name}
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Barbeiros */}
          <div className="grid grid-cols-1 gap-4 w-full max-w-full pb-[120px] pr-1">
            {barbers.length === 0 ? (
              <div className="text-center py-8">
                <Text className="text-gray-500">Nenhum barbeiro disponível para os serviços selecionados</Text>
              </div>
            ) : (
              barbers.map((barber) => {
                const checked = isBarberSelected(barber.id);
                const isImageLoading = imageLoadingStates[barber.id];

                return (
                  <div
                    key={barber.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleBarber(barber.id)}
                    onKeyDown={(e) => e.key === "Enter" && toggleBarber(barber.id)}
                    className={cn(
                      "w-full h-auto bg-transparent border-0 shadow-none p-0",
                      "focus:outline-none cursor-pointer",
                      "transition-transform hover:scale-[1.005] active:scale-[0.98]"
                    )}
                    aria-label={`Select barber ${barber.name}`}
                  >
                    <Card
                      style={{
                        minWidth: "100%",
                        minHeight: "100%",
                      }}
                      className={cn(checked && "!bg-[#99B58E]")}
                    >
                      <div className="flex items-center w-full h-auto flex-1 relative">

                        {/* Imagem do barbeiro */}
                        <CircleIcon className="!max-w-32 !max-h-32">
                          {isImageLoading && (
                            <div className="size-full flex items-center justify-center">
                              <div className="loading loading-spinner text-white"></div>
                            </div>
                          )}

                          <img
                            onLoad={() => handleImageLoad(barber.id)}
                            alt={`Barber ${barber.name}`}
                            src={barber.avatarUrl || getIcons("fallback")}
                            onError={(e) => handleImageError(e, barber.id)}
                            className={cn(
                              "w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover",
                              isImageLoading && "hidden"
                            )}
                          />
                        </CircleIcon>

                        {/* Informações do barbeiro */}
                        <div className="flex flex-col justify-start items-start w-full h-auto gap-2 flex-grow pl-2">
                          <Title className="w-full text-start truncate max-w-[65%]">
                            {barber.name}
                          </Title>

                          {/* Função/especialidade */}
                          <Text className={cn(
                            "text-sm text-gray-600 truncate max-w-[calc(100% - 25px)]",
                            checked && "text-[#111827]"
                          )}>
                            {barber.role}
                          </Text>

                          {/* Localização */}
                          <Text
                            className={cn(
                              "flex items-center gap-[5px] truncate max-w-[calc(100% - 25px)]",
                              checked && "text-[#111827]"
                            )}
                          >
                            <img
                              alt="Icon location"
                              className={cn(
                                "size-5",
                                checked && "brightness-[0.65]"
                              )}
                              src={getIcons("location_outlined_green")}
                            />
                            <div
                              className={cn(
                                "h-2.5 rounded-2xl w-[0.8px] bg-[#6B7280]",
                                checked && "bg-[#111827]"
                              )}
                            />
                            {barber.barberShop?.name || 'Barbearia'}
                          </Text>

                          {/* Avaliação e número de cortes */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <img
                                alt="Icon star"
                                src={getIcons("star_solid_green")}
                                className={cn(
                                  "size-4",
                                  checked && "brightness-[0.65]"
                                )}
                              />
                              <Text className={cn(
                                "text-sm",
                                checked && "text-[#111827]"
                              )}>
                                {barber.averageRating.toFixed(1)}
                              </Text>
                            </div>
                            <div className={cn(
                              "h-3 w-[1px] bg-[#6B7280]",
                              checked && "bg-[#111827]"
                            )} />
                            <Text className={cn(
                              "text-sm text-gray-500",
                              checked && "text-[#111827]"
                            )}>
                              {barber.totalAppointments} cortes
                            </Text>
                          </div>

                          {/* Serviços que o barbeiro pode realizar */}
                          <div className="flex flex-wrap gap-1 max-w-[calc(100% - 25px)]">
                            {barber.services?.slice(0, 3).map(service => (
                              <div
                                key={service.id}
                                className={cn(
                                  "bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs",
                                  checked && "bg-[#6C8762] text-white"
                                )}
                              >
                                {service.name}
                              </div>
                            ))}
                            {(barber.services?.length || 0) > 3 && (
                              <div className={cn(
                                "text-xs text-gray-500",
                                checked && "text-[#111827]"
                              )}>
                                +{(barber.services?.length || 0) - 3} mais
                              </div>
                            )}
                          </div>
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

          {/* Botão de continuar fixo */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-4 pb-6 px-4">
            <Button
              type="button"
              className="max-w-80 m-auto h-14 w-full"
              disabled={!selectedBarbers.length}
              onClick={handleContinue}
            >
              {selectedBarbers.length
                ? `Continuar com ${selectedBarbers.length} barbeiro${selectedBarbers.length !== 1 ? 's' : ''} • ${formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(calculateTotal())}`
                : "Selecione pelo menos um barbeiro"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};