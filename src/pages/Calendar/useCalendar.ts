import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentDate } from "@/utils/utils";
import { useOrder, useOrderActions } from "@/store/useOrderStore";

export const useCalendar = () => {
  const order = useOrder();
  const navigate = useNavigate();
  const { setDate } = useOrderActions();
  const { dayOfWeek, formattedDate } = getCurrentDate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth();

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

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate >= today) {
      setSelectedDate(clickedDate);
    }
    if (selectedTime) {
      setDate(combineDateTime(day, selectedTime));
    }
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
    if (order.date) {
      const day = new Date(order.date).getDate();
      setDate(combineDateTime(day, time));
    }
  };

  return {
    days,
    order,
    setDate,
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
    setCurrentDate,
    handleDayClick,
    isCurrentMonth,
    setSelectedTime,
    handlePrevMonth,
    handleNextMonth,
    isDateSelectable,
    handleTimeSelection,
  };
};