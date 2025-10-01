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

import { barbersService, workingHoursService } from "@/services";
import type { Barber, Service, AvailableTimeSlot } from "@/services";

interface SelectedService extends Service {
  selectedBarbers?: string[];
}

interface BookingData {
  selectedServices: SelectedService[];
  selectedBarbers: string[];
  totalPrice: number;
}

export const ScheduleImproved = () => {
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // 30 dias no futuro

  // Gerar datas dos próximos 30 dias
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        })
      });
    }
    return dates;
  };

  const availableDates = generateDates();

  useEffect(() => {
    const loadBookingData = () => {
      const data = localStorage.getItem('bookingData');
      if (!data) {
        toast.error('Dados de agendamento não encontrados');
        navigate('/services');
        return;
      }

      const booking: BookingData = JSON.parse(data);
      setBookingData(booking);
    };

    const loadBarbers = async () => {
      try {
        setLoading(true);
        const data = localStorage.getItem('bookingData');
        if (!data) return;

        const booking: BookingData = JSON.parse(data);
        const barbersData = await Promise.all(
          booking.selectedBarbers.map(id => barbersService.getById(id))
        );
        setBarbers(barbersData);
      } catch (error) {
        console.error('Erro ao carregar barbeiros:', error);
        toast.error('Erro ao carregar barbeiros');
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
    loadBarbers();
  }, [navigate]);

  // Carregar horários disponíveis quando data é selecionada
  useEffect(() => {
    if (selectedDate && bookingData) {
      loadAvailableSlots();
    }
  }, [selectedDate, bookingData]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !bookingData) return;

    try {
      setLoadingSlots(true);
      setSelectedTime("");

      const serviceIds = bookingData.selectedServices.map(s => s.id);
      const response = await workingHoursService.getAvailableSlots({
        date: selectedDate,
        barberIds: bookingData.selectedBarbers,
        serviceIds
      });

      // A API retorna um objeto com { times: [...] }, então pegamos apenas o array times
      setAvailableSlots(response.times || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast.error('Erro ao carregar horários disponíveis');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Selecione uma data e horário');
      return;
    }

    if (!bookingData) return;

    const finalBookingData = {
      ...bookingData,
      selectedDate,
      selectedTime,
    };

    localStorage.setItem('finalBookingData', JSON.stringify(finalBookingData));
    navigate("/payment");
  };

  if (loading) return <Loading />;
  if (!bookingData) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Escolha Data e Horário" backPath="/barbers" />

        <div className="flex flex-col w-full justify-between items-start gap-4 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">

          {/* Resumo do agendamento */}
          <div className="w-full bg-gray-50 rounded-lg p-4">
            <Title className="mb-3 text-sm">Resumo do agendamento:</Title>

            {/* Serviços */}
            <div className="mb-3">
              <Text className="text-xs text-gray-600 mb-1">Serviços:</Text>
              <div className="flex flex-wrap gap-1">
                {bookingData.selectedServices.map(service => (
                  <div
                    key={service.id}
                    className="bg-[#6C8762] text-white px-2 py-1 rounded text-xs"
                  >
                    {service.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Barbeiros */}
            <div className="mb-3">
              <Text className="text-xs text-gray-600 mb-1">Barbeiros:</Text>
              <div className="flex flex-wrap gap-2">
                {barbers.map(barber => (
                  <div key={barber.id} className="flex items-center gap-2">
                    <CircleIcon className="!w-6 !h-6">
                      <img
                        src={barber.avatarUrl || getIcons("fallback")}
                        alt={barber.name}
                        className="w-full h-full object-cover"
                      />
                    </CircleIcon>
                    <Text className="text-xs">{barber.name}</Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <Text className="text-sm font-medium">Total:</Text>
                <Title className="text-lg text-[#6C8762]">
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(bookingData.totalPrice)}
                </Title>
              </div>
            </div>
          </div>

          {/* Seleção de Data */}
          <div className="w-full">
            <Title className="mb-3">Escolha o dia:</Title>
            <div className="flex overflow-x-auto gap-2 pb-2">
              {availableDates.map(({ date, display }) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "min-w-[80px] p-3 rounded-lg border text-center transition-colors",
                    selectedDate === date
                      ? "bg-[#6C8762] text-white border-[#6C8762]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#6C8762]"
                  )}
                >
                  <div className="text-xs font-medium">{display}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Horário */}
          {selectedDate && (
            <div className="w-full">
              <Title className="mb-3">Escolha o horário:</Title>

              {loadingSlots ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner text-[#6C8762]"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Text className="text-gray-500">Nenhum horário disponível para esta data</Text>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-colors",
                        !slot.available
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : selectedTime === slot.time
                          ? "bg-[#6C8762] text-white border-[#6C8762]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#6C8762]"
                      )}
                    >
                      <div className="text-sm font-medium">{slot.time}</div>
                      {slot.availableBarbers && (
                        <div className="text-xs text-gray-500 mt-1">
                          {slot.availableBarbers} disponível{slot.availableBarbers !== 1 ? 'is' : ''}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Espaçador para o botão fixo */}
          <div className="h-24" />
        </div>

        {/* Botão de continuar fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-4 pb-6 px-4">
          <Button
            type="button"
            className="max-w-80 m-auto h-14 w-full"
            disabled={!selectedDate || !selectedTime}
            onClick={handleContinue}
          >
            {selectedDate && selectedTime
              ? `Confirmar agendamento para ${new Date(selectedDate).toLocaleDateString('pt-BR')} às ${selectedTime}`
              : "Selecione data e horário"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};