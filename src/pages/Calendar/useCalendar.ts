import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrder } from "@/store/useOrderStore";
import { getCurrentDate } from "@/utils/utils";

export const useCalendar = () => {
  const navigate = useNavigate();
  const { formattedDate } = getCurrentDate();
  const { barber, date, setDateTime } = useOrder();
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

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
        
        // Usar formato ISO date (YYYY-MM-DD) ao invés de timestamp completo
        const dateString = `${year}-${month}-${day}`;
        
        // Para buscar apenas um dia específico, usar a mesma data para start e end
        const { data, error } = await supabase.rpc("get_available_time_slots", {
          barber_id: barberId,
          start_date: dateString,
          end_date: dateString,
        });

        if (error) {
          console.error("Erro na RPC:", error);
          throw error;
        }

        console.log("Dados retornados da RPC:", data);

        // Filtrar e remover duplicatas dos horários
        const uniqueTimes = new Set<string>();
        const filteredData = data?.filter((slot: { available_time: string; formatted_time: string }) => {
          // Verificar se o slot é realmente para a data selecionada
          const slotDate = new Date(slot.available_time);
          const slotDateString = slotDate.toISOString().split('T')[0];
          
          // Só incluir se for exatamente a data selecionada e se não for duplicata
          if (slotDateString === dateString && !uniqueTimes.has(slot.formatted_time)) {
            uniqueTimes.add(slot.formatted_time);
            return true;
          }
          return false;
        }) || [];

        console.log("Dados filtrados:", filteredData);

        const times = filteredData.map(
          (slot: { available_time: string; formatted_time: string }) =>
            slot.formatted_time
        );

        // Ordenar os horários para garantir ordem cronológica
        times.sort((a: string, b: string) => {
          const timeA = a.split(':').map(Number);
          const timeB = b.split(':').map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });

        console.log("Horários finais:", times);
        setAvailableSlots(times);
      } catch (error) {
        console.error("Erro ao buscar disponibilidade:", error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
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
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [barber?.id, selectedDate, fetchBarberAvailability]);

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
    handleDayClick,
    handlePrevMonth,
    isDateSelectable,
    handleNextMonth,
    isTimeAvailable,
    handleTimeSelection,
  };
};