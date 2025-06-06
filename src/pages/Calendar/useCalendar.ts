import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { getCurrentDate } from "@/utils/utils";
import { useOrder } from "@/store/useOrderStore";

export const useCalendar = () => {
  const navigate = useNavigate();
  const { formattedDate } = getCurrentDate();
  const [loading, setLoading] = useState(false);
  const { barber, date, setDateTime } = useOrder();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

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

  // Função para obter os dias do mês
  const getDaysInMonth = (date: Date) => {
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
  };

  // Função que irá buscar os horários disponíveis no Supabase
  const fetchBarberAvailability = async (barberId: string, selectedDate: Date) => {
    setLoading(true);
    try {
      // Ajuste para pegar o dia completo (00:00 até 23:59)
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
  
      const { data, error } = await supabase.rpc("get_available_time_slots", {
        barber_id: barberId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
  
      if (error) throw error;
  
      console.log("Slots retornados:", data); // Depuração
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const times = data?.map((slot: any) => slot.formatted_time) || [];
      setAvailableSlots(times);
    } catch (error) {
      console.error("Erro ao buscar disponibilidade:", error);
    } finally {
      setLoading(false);
    }
  };

  // UseEffect para pegar os horários disponíveis assim que a data do barbeiro mudar
  useEffect(() => {
    if (barber?.id && selectedDate) {
      fetchBarberAvailability(barber.id, selectedDate);
    }
  }, [barber?.id, selectedDate]);

  // Funções de navegação
  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
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

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      setDateTime(selectedDate, time);
    }
  };

  // Verificar se a data é válida (não no passado)
  const isDateSelectable = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return date >= new Date();
  };

  // Função que verifica se o horário está disponível
  const isTimeAvailable = (time: string) => {
    return availableSlots.includes(time);
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  return {
    days,
    date,
    loading,
    navigate,
    monthNames,
    daysOfWeek,
    formatTime,
    isSelected,
    currentDate,
    selectedDate,
    selectedTime,
    formattedDate,
    setCurrentDate,
    availableSlots,
    handleDayClick,
    handlePrevMonth,
    isDateSelectable,
    handleNextMonth,
    isTimeAvailable,
    handleTimeSelection,
  };
};
