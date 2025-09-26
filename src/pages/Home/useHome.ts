import { useState, useEffect } from "react";
import { servicesService } from "@/services/services.service";
import { barbersService } from "@/services/barbers.service";
import { appointmentsService } from "@/services/appointments.service";
import { logger } from "@/utils/logger";
import toast from "react-hot-toast";
import { getIcons } from "@/assets/icons";

export interface HomeData {
  promotions: any[];
  appointments: any[];
  barbers: any[];
}

export const useHome = () => {
  const [data, setData] = useState<HomeData>({
    promotions: [],
    appointments: [],
    barbers: [],
  });
  const [loading, setLoading] = useState({
    promotions: true,
    appointments: true,
    barbers: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<string, boolean>
  >({});

  const fetchPromotions = async () => {
    try {
      logger.info("Carregando promoções da semana na Home");

      // Buscar serviços com promoção (limit 6 para não sobrecarregar)
      const services = await servicesService.getAll();

      // Filtrar serviços que têm desconto ou marcar como promoção
      const responseData = "data" in services ? services.data : services;
      const promotions =
        responseData?.filter(
          (service: any) =>
            service.promotionalPrice && service.promotionalPrice < service.price
        ) || [];

      // Se não houver promoções específicas, pegar os serviços mais populares
      const promotionData =
        promotions.length > 0 ? promotions : responseData?.slice(0, 6) || [];

      setData((prev) => ({ ...prev, promotions: promotionData }));
      logger.info(`Carregadas ${promotionData.length} promoções`);
    } catch (error) {
      logger.error("Erro ao carregar promoções:", error);
      toast.error("Erro ao carregar promoções");
    } finally {
      setLoading((prev) => ({ ...prev, promotions: false }));
    }
  };

  const fetchActiveAppointments = async () => {
    try {
      logger.info("Carregando agendamentos ativos na Home");

      const appointments = await appointmentsService.getMyActiveAppointments();

      // Filtrar apenas agendamentos pendentes/confirmados (máximo 5)
      const activeAppointments = appointments
        .filter((appointment) =>
          ["PENDING", "CONFIRMED"].includes(appointment.status)
        )
        .slice(0, 5);

      setData((prev) => ({ ...prev, appointments: activeAppointments }));
      logger.info(
        `Carregados ${activeAppointments.length} agendamentos ativos`
      );
    } catch (error) {
      logger.error("Erro ao carregar agendamentos:", error);
      // Não mostrar toast para agendamentos pois pode não ter nenhum
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  };

  const fetchBarbersForHome = async () => {
    try {
      logger.info("Carregando barbeiros para Home");

      const barbers = await barbersService.getForHome(8); // Máximo 8 barbeiros

      setData((prev) => ({ ...prev, barbers }));
      logger.info(`Carregados ${barbers.length} barbeiros`);
    } catch (error) {
      logger.error("Erro ao carregar barbeiros:", error);
      toast.error("Erro ao carregar barbeiros");
    } finally {
      setLoading((prev) => ({ ...prev, barbers: false }));
    }
  };

  const refreshData = async () => {
    setLoading({
      promotions: true,
      appointments: true,
      barbers: true,
    });
    setError(null);

    await Promise.all([
      fetchPromotions(),
      fetchActiveAppointments(),
      fetchBarbersForHome(),
    ]);
  };

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

  useEffect(() => {
    refreshData();
  }, []);

  const isLoading =
    loading.promotions || loading.appointments || loading.barbers;

  return {
    data,
    loading,
    error,
    isLoading,
    refreshData,
    handleImageLoad,
    handleImageError,
    imageLoadingStates,
    setImageLoadingStates,
    hasPromotions: data.promotions.length > 0,
    hasAppointments: data.appointments.length > 0,
    hasBarbers: data.barbers.length > 0,
  };
};
