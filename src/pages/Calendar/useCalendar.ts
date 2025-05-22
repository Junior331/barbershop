import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import { getCurrentDate } from "@/utils/utils";
import { useBarberSchedules } from "@/hooks/useBarberSchedules";
import { useOrder, useOrderActions } from "@/store/useOrderStore";

export const useCalendar = () => {
  const order = useOrder();
  const navigate = useNavigate();
  const { setDate } = useOrderActions();
  const [loading, setLoading] = useState(false);
  const { dayOfWeek, formattedDate } = getCurrentDate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { schedules, fetchSchedules } = useBarberSchedules(order.barber?.id);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth();
  const [availableSlots, setAvailableSlots] = useState<
    Record<string, string[]>
  >({});

  const monthNames = [
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
  ];

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Cria array com dias do mês alinhados corretamente
    return Array.from({ length: daysInMonth + startDayOfWeek }, (_, i) => {
      const day = i - startDayOfWeek + 1;
      return day > 0 ? day : null;
    });
  };

  const fetchBarberAvailability = async (barberId: string, date: Date) => {
    setLoading(true);
    try {
      // Aqui você faria a chamada ao Supabase para pegar os horários ocupados
      // Este é um exemplo - ajuste conforme sua estrutura real no Supabase
      const { data, error } = await supabase
        .from("schedules")
        .select("date_time")
        .eq("barber_id", barberId)
        .gte("date_time", new Date(date.setHours(0, 0, 0, 0)).toISOString())
        .lte(
          "date_time",
          new Date(date.setHours(23, 59, 59, 999)).toISOString()
        );

      if (error) throw error;

      // Converter os horários ocupados para um formato mais fácil de trabalhar
      const occupiedSlots =
        data?.map((item) => {
          const d = new Date(item.date_time);
          return `${d.getHours()}:${d
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        }) || [];

      // Gerar todos os slots possíveis (exemplo: das 9h às 18h, a cada 30 minutos)
      const allSlots = [];
      for (let hour = 9; hour < 18; hour++) {
        allSlots.push(`${hour}:00`);
        allSlots.push(`${hour}:30`);
      }

      // Filtrar os slots disponíveis
      const available = allSlots.filter(
        (slot) => !occupiedSlots.includes(slot)
      );

      // Armazenar por dia (no formato YYYY-MM-DD)
      const dateKey = date.toISOString().split("T")[0];
      setAvailableSlots((prev) => ({
        ...prev,
        [dateKey]: available,
      }));
    } catch (error) {
      console.error("Error fetching barber availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const isTimeAvailable = (time: string) => {
    if (!selectedDate) return true;
    
    const [hours, minutes] = time.split(':');
    const slotStart = new Date(selectedDate);
    slotStart.setHours(parseInt(hours), parseInt(minutes));
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 30); // Assumindo 30min por serviço
    
    // Verificar se há conflito com agendamentos existentes
    return !schedules.some(schedule => {
      const scheduleStart = new Date(schedule.date_time);
      const scheduleEnd = new Date(scheduleStart);
      scheduleEnd.setMinutes(scheduleStart.getMinutes() + schedule.duration);
      
      return (slotStart < scheduleEnd && slotEnd > scheduleStart);
    });
  };


  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const isDateSelectable = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    let hoursNumber = Number(hours);

    if (hoursNumber >= 24) {
      hoursNumber = 0;
    }

    const date = new Date();
    date.setHours(hoursNumber);
    date.setMinutes(Number(minutes));

    return date
      .toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", " ");
  };

  const combineDateTime = (day: number, time: string): string => {
    const [hours, minutes] = time.split(":");
    let dateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
      Number(hours),
      Number(minutes)
    );

    if (Number(hours) >= 24) {
      dateObj = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
      dateObj.setHours(Number(hours) - 24);
    }

    return dateObj.toISOString();
  };

  const handleDayClick = async (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    const startDate = new Date(clickedDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(clickedDate);
    endDate.setHours(23, 59, 59, 999);
    
    await fetchSchedules(startDate, endDate);
    
    if (clickedDate >= startDate) {
      setSelectedDate(clickedDate);
      if (order.barber?.id) {
        await fetchBarberAvailability(order.barber.id, clickedDate);
      }
    }
    if (selectedTime) {
      setDate(combineDateTime(day, selectedTime));
    }
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);

    if (selectedDate) {
      const day = selectedDate.getDate();
      setDate(combineDateTime(day, time));
    }
  };

  return {
    days,
    order,
    setDate,
    loading,
    navigate,
    dayOfWeek,
    formatTime,
    monthNames,
    daysOfWeek,
    isSelected,
    currentDate,
    selectedDate,
    selectedTime,
    formattedDate,
    availableSlots,
    setCurrentDate,
    handleDayClick,
    isCurrentMonth,
    isTimeAvailable,
    setSelectedTime,
    handlePrevMonth,
    handleNextMonth,
    isDateSelectable,
    handleTimeSelection,
  };
};
