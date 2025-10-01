import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/store/useOrderStore";
import { getCurrentDate } from "@/utils/utils";
import { appointmentsService, Appointment } from "@/services/appointments.service";
import { useAuth } from "@/context/AuthContext";
import { workingHoursService, AvailableTimeSlot } from "@/services/working-hours.service";

export const useCalendar = () => {
  const navigate = useNavigate();
  const { formattedDate } = getCurrentDate();
  const { barber, date, services, setDateTime } = useOrder();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const monthNames = useMemo(
    () => [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    []
  );

  const daysOfWeek = useMemo(
    () => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    []
  );

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    return Array.from({ length: daysInMonth + startDayOfWeek }, (_, i) => {
      const day = i - startDayOfWeek + 1;
      return day > 0 ? day : 0;
    });
  }, []);

  // Função de fetch para buscar a disponibilidade do barbeiro
  const fetchBarberAvailability = useCallback(
    async (barberId: string, selectedDate: Date) => {
      setLoading(true);
      try {
        // Limpar os slots disponíveis antes de buscar novos
        setAvailableSlots([]);

        // Formatação correta da data para evitar problemas de timezone
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        console.log("Buscando horários disponíveis:", {
          barberId,
          date: dateString
        });

        // Usar o service de working hours para buscar horários disponíveis
        const response = await workingHoursService.getAvailableTimes(
          barberId,
          dateString
        );

        console.log("Resposta da API:", response);

        // A API retorna um objeto com { times: [...] }
        const availableTimeSlots = response.times || [];

        // Verificar se é hoje para filtrar horários que já passaram
        const now = new Date();
        const isToday = selectedDate.getDate() === now.getDate() &&
                       selectedDate.getMonth() === now.getMonth() &&
                       selectedDate.getFullYear() === now.getFullYear();

        // Extrair apenas os horários disponíveis e futuros
        const availableTimes = availableTimeSlots
          .filter(slot => {
            if (!slot.available) return false;

            // Se não for hoje, todos os horários disponíveis são válidos
            if (!isToday) return true;

            // Se for hoje, verificar se o horário ainda não passou
            const [hours, minutes] = slot.time.split(':').map(Number);
            const slotTime = new Date(selectedDate);
            slotTime.setHours(hours, minutes, 0, 0);

            return slotTime > now;
          })
          .map(slot => slot.time);

        console.log("Horários disponíveis:", availableTimes);
        setAvailableSlots(availableTimes);
      } catch (error) {
        console.error("Erro ao buscar disponibilidade:", error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    },
    [services]
  );

  // Função para buscar agendamentos do barbeiro por data
  const fetchBarberAppointments = useCallback(
    async (barberId: string, selectedDate: Date) => {
      setLoadingAppointments(true);
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const appointmentData = await appointmentsService.getBarberAppointmentsByDate(barberId, dateString);
        setAppointments(appointmentData);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    },
    []
  );

  // UseEffect para pegar os horários disponíveis assim que a data do barbeiro mudar
  useEffect(() => {
    if (barber?.id && selectedDate) {
      // Adicionar um pequeno delay para evitar múltiplas chamadas rápidas
      const timeoutId = setTimeout(() => {
        fetchBarberAvailability(barber.id, selectedDate);

        // Buscar agendamentos apenas se o usuário for um barbeiro
        if (user?.role === 'BARBER') {
          fetchBarberAppointments(user.id, selectedDate);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [barber?.id, selectedDate, services, user?.id, user?.role, fetchBarberAvailability, fetchBarberAppointments]);

  // Funções de navegação para o mês
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  // Função para selecionar o dia
  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Resetar horário selecionado quando mudar de data
    setSelectedTime(null);
    setSelectedDate(clickedDate);
    // Limpar agendamentos anteriores
    setAppointments([]);
  };

  // Função para selecionar o horário
  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      setDateTime(selectedDate, time);
    }
  };

  // Função para verificar se a data é válida (não no passado)
  const isDateSelectable = (day: number) => {
    if (!day) return false;
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  // Função que verifica se o horário está disponível
  const isTimeAvailable = (time: string) => {
    return availableSlots.includes(time);
  };

  // Função de dias do mês
  const days = useMemo(
    () => getDaysInMonth(currentDate),
    [currentDate, getDaysInMonth]
  );

  return {
    days,
    date,
    loading,
    navigate,
    monthNames,
    daysOfWeek,
    isSelected: (day: number) =>
      selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear(),
    currentDate,
    selectedDate,
    selectedTime,
    formattedDate,
    setCurrentDate,
    availableSlots,
    appointments,
    loadingAppointments,
    handleDayClick,
    handlePrevMonth,
    isDateSelectable,
    handleNextMonth,
    isTimeAvailable,
    handleTimeSelection,
  };
};