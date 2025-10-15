import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { cn, formatter, getPaymentMethodIcon } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import {
  Text,
  Title,
  Button,
  Loading,
  CircleIcon,
} from "@/components/elements";

import { appointmentsService, paymentsService } from "@/services";
import type { Barber, Service } from "@/services";
import { useMercadoPago } from "@/context/MercadoPagoContext";

type PaymentMethod = 'CREDIT' | 'DEBIT' | 'PIX' | 'CASH' | 'WALLET';

interface SelectedService extends Service {
  selectedBarbers?: string[];
}

interface FinalBookingData {
  selectedServices: SelectedService[];
  selectedBarbers: string[];
  totalPrice: number;
  selectedDate: string;
  selectedTime: string;
}

export const PaymentImproved = () => {
  const navigate = useNavigate();
  const { deviceId, initialized: mpInitialized } = useMercadoPago();

  const [bookingData, setBookingData] = useState<FinalBookingData | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("CREDIT");
  const [paymentMethods] = useState<{ id: PaymentMethod; name: string; icon: string }[]>([
    { id: "CREDIT", name: "Cartão de Crédito", icon: "card_credit" },
    { id: "DEBIT", name: "Cartão de Débito", icon: "card_credit" },
    { id: "PIX", name: "PIX", icon: "pix_solid" },
    { id: "CASH", name: "Dinheiro (na barbearia)", icon: "wallet" }
  ]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadBookingData = () => {
      const data = localStorage.getItem('finalBookingData');
      if (!data) {
        toast.error('Dados de agendamento não encontrados');
        navigate('/schedule');
        return;
      }

      const booking: FinalBookingData = JSON.parse(data);
      setBookingData(booking);
    };

    const loadBarbers = async () => {
      try {
        setLoading(true);
        const data = localStorage.getItem('finalBookingData');
        if (!data) return;

        const booking: FinalBookingData = JSON.parse(data);
        const barbersData = await Promise.all(
          booking.selectedBarbers.map(id =>
            // Simulando busca de barbeiro por ID
            Promise.resolve({
              id,
              name: `Barbeiro ${id.substring(0, 8)}`,
              avatarUrl: '',
              role: 'Barbeiro',
              averageRating: 4.5,
              totalAppointments: 150,
              totalReviews: 40,
              barberShop: { name: 'Barbearia Principal' }
            } as Barber)
          )
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

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const calculateDuration = () => {
    if (!bookingData) return 0;
    return bookingData.selectedServices.reduce((total, service) => {
      return total + service.durationMinutes;
    }, 0);
  };

  const handleConfirmPayment = async () => {
    console.log('🚀 selectedPaymentMethod ::', selectedPaymentMethod);
    if (!bookingData) return;

    setProcessing(true);

    try {
      // Preparar dados do agendamento
      // Use first service and barber (backend expects single values)
      const firstService = bookingData.selectedServices[0];
      const firstBarberId = bookingData.selectedBarbers[0];

      // Get barberShopId from service
      const barberShopId = firstService.barberShop?.id;

      if (!barberShopId) {
        throw new Error('ID da barbearia não encontrado');
      }

      // Combine date and time into ISO format
      const startDateTime = new Date(bookingData.selectedDate);
      const [hours, minutes] = bookingData.selectedTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const appointmentData = {
        barberId: firstBarberId,
        serviceId: firstService.id,
        barberShopId: barberShopId,
        scheduledTo: startDateTime.toISOString(),
        totalPrice: bookingData.totalPrice,
        paymentMethod: selectedPaymentMethod === 'CASH' ? 'WALLET' : selectedPaymentMethod,
        status: 'PENDING' as const,
        paymentStatus: 'PENDING' as const,
      };

      let appointmentId: string;

      // Se for pagamento em dinheiro, criar agendamento diretamente
      if (selectedPaymentMethod === "CASH") {
        const appointment = await appointmentsService.create(appointmentData);
        appointmentId = appointment.id;

        toast.success('Agendamento realizado com sucesso! Pagamento será feito na barbearia.');

        // Limpar localStorage
        localStorage.removeItem('selectedServices');
        localStorage.removeItem('bookingData');
        localStorage.removeItem('finalBookingData');

        navigate(`/booking-confirmation/${appointmentId}`);
        return;
      }

      // Criar agendamento primeiro (status PENDING)
      const appointment = await appointmentsService.create(appointmentData);
      appointmentId = appointment.id;

      // 🎯 HYBRID PAYMENT FLOW: PIX in-app, Cards redirect to Mercado Pago
      console.log('🔍 DEBUG - Selected Payment Method:', selectedPaymentMethod);
      console.log('🔍 DEBUG - Payment Method Type:', typeof selectedPaymentMethod);
      console.log('🔍 DEBUG - Appointment ID:', appointmentId);
      console.log('🔍 DEBUG - Is PIX?', selectedPaymentMethod === "PIX");
      console.log('🔍 DEBUG - Is CREDIT?', selectedPaymentMethod === "CREDIT");
      console.log('🔍 DEBUG - Is DEBIT?', selectedPaymentMethod === "DEBIT");

      // 🚨 ALERT para debug - remover depois
      if (selectedPaymentMethod === "PIX") {
        alert('🔵 ENTRANDO NO FLUXO PIX - Vou chamar createPixPayment()');
      } else if (selectedPaymentMethod === "CREDIT" || selectedPaymentMethod === "DEBIT") {
        alert('💳 ENTRANDO NO FLUXO CARTÃO - Vou chamar createPreference()');
      }

      if (selectedPaymentMethod === "PIX") {
        console.log('✅ Entering PIX payment flow (Checkout Transparente)');
        console.log('📊 Booking data:', bookingData);
        console.log('🔐 Device ID:', deviceId);

        // ✅ PIX: Checkout Transparente - Show QR Code in our app
        toast.loading('Gerando código PIX...', { id: 'pix-loading' });

        const pixPayment = await paymentsService.createPixPayment({
          appointmentId: appointmentId,
          amount: bookingData.totalPrice,
          description: `Agendamento - ${bookingData.selectedServices.map(s => s.name).join(', ')}`,
          metadata: {
            deviceId: deviceId || 'unknown',
            mpInitialized: mpInitialized,
            userAgent: navigator.userAgent,
          }
        });

        console.log('✅ PIX Payment criado:', pixPayment);
        console.log('📱 QR Code disponível:', !!pixPayment.qrCodeBase64);
        console.log('🔍 QR Code string:', pixPayment.qrCode ? 'SIM' : 'NÃO');
        console.log('🔍 QR Code Base64:', pixPayment.qrCodeBase64 ? 'SIM' : 'NÃO');
        console.log('🔍 Payment URL (NÃO DEVE TER):', pixPayment.paymentUrl || 'NENHUMA');

        // Validação crítica: PIX DEVE ter QR Code, NÃO deve ter paymentUrl
        if (!pixPayment.qrCode || !pixPayment.qrCodeBase64) {
          console.error('❌ ERRO: PIX payment sem QR Code!', pixPayment);
          toast.error('Erro ao gerar QR Code PIX. Tente novamente.', { id: 'pix-loading' });
          setProcessing(false);
          return;
        }

        // Se tiver paymentUrl, IGNORAR (não queremos redirect)
        if (pixPayment.paymentUrl) {
          console.warn('⚠️ paymentUrl detectado no PIX (será ignorado):', pixPayment.paymentUrl);
          delete pixPayment.paymentUrl; // Remove para garantir
        }

        toast.success('Código PIX gerado com sucesso!', { id: 'pix-loading' });

        // Limpar localStorage de booking
        localStorage.removeItem('selectedServices');
        localStorage.removeItem('bookingData');
        localStorage.removeItem('finalBookingData');

        // Navigate to PIX payment page with QR Code data
        console.log('🚀 Navegando para tela de QR Code PIX...');
        navigate(`/payment/pix/${appointmentId}`, {
          state: {
            paymentId: pixPayment.id,
            appointmentId: appointmentId,
            amount: bookingData.totalPrice,
            qrCode: pixPayment.qrCode,
            qrCodeBase64: pixPayment.qrCodeBase64,
            services: bookingData.selectedServices.map(s => s.name).join(', '),
          }
        });

      } else if (selectedPaymentMethod === "CREDIT" || selectedPaymentMethod === "DEBIT") {
        console.log('💳 Entering CARD payment flow (Checkout Pro redirect)');
        console.log('🔐 Device ID:', deviceId);

        // 💳 CARD: Checkout Pro - Redirect to Mercado Pago secure page
        toast.loading('Preparando pagamento seguro...', { id: 'card-loading' });

        const preference = await paymentsService.createPreference({
          appointmentId: appointmentId,
          amount: bookingData.totalPrice,
          method: selectedPaymentMethod === 'CREDIT' ? 'CREDIT_CARD' : 'DEBIT_CARD',
          description: `Agendamento - ${bookingData.selectedServices.map(s => s.name).join(', ')}`,
          metadata: {
            deviceId: deviceId || 'unknown',
            mpInitialized: mpInitialized,
            userAgent: navigator.userAgent,
          }
        });

        console.log('🔗 Preference criada:', preference);
        console.log('🔗 Payment URL:', preference.paymentUrl);

        if (preference.paymentUrl) {
          toast.success('Redirecionando para pagamento seguro...', { id: 'card-loading' });

          // Limpar localStorage de booking
          localStorage.removeItem('selectedServices');
          localStorage.removeItem('bookingData');
          localStorage.removeItem('finalBookingData');

          // Redirect to Mercado Pago (secure PCI-compliant form)
          setTimeout(() => {
            if (preference.paymentUrl) {
              window.location.href = preference.paymentUrl;
            }
          }, 1000);
          return;
        } else {
          console.error('❌ paymentUrl não encontrado:', preference);
          toast.error('Erro: Link de pagamento não foi gerado. Tente novamente.', { id: 'card-loading' });
          setProcessing(false);
          return;
        }
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading />;
  if (!bookingData) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Confirmação e Pagamento" backPath="/schedule" />

        <div className="flex flex-col w-full justify-between items-start gap-4 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">

          {/* Resumo completo do agendamento */}
          <Card className="w-full">
            <div className="p-4">
              <Title className="mb-4 text-lg">Resumo do Agendamento</Title>

              {/* Data e Horário */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#6C8762] bg-opacity-10 rounded-lg">
                <img
                  src={getIcons("calendar_solid_green")}
                  alt="Calendar"
                  className="w-6 h-6"
                />
                <div>
                  <Text className="font-medium">
                    {new Date(bookingData.selectedDate).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    às {bookingData.selectedTime} • {calculateDuration()} minutos
                  </Text>
                </div>
              </div>

              {/* Serviços */}
              <div className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Serviços:</Text>
                <div className="space-y-2">
                  {bookingData.selectedServices.map(service => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div>
                        <Text className="font-medium">{service.name}</Text>
                        <Text className="text-sm text-gray-600">{service.durationMinutes}min</Text>
                      </div>
                      <Text className="font-medium text-[#6C8762]">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(service.pricing.finalPrice)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barbeiros */}
              <div className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Barbeiros:</Text>
                <div className="space-y-2">
                  {barbers.map(barber => (
                    <div key={barber.id} className="flex items-center gap-3">
                      <CircleIcon className="!w-8 !h-8">
                        <img
                          src={barber.avatarUrl || getIcons("fallback")}
                          alt={barber.name}
                          className="w-full h-full object-cover"
                        />
                      </CircleIcon>
                      <div>
                        <Text className="font-medium">{barber.name}</Text>
                        <Text className="text-sm text-gray-600">{barber.role}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <Text className="text-lg font-medium">Total:</Text>
                  <Title className="text-xl text-[#6C8762]">
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
          </Card>

          {/* Seleção de método de pagamento */}
          <div className="w-full">
            <Title className="mb-3">Método de Pagamento:</Title>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-3",
                    selectedPaymentMethod === method.id
                      ? "bg-[#6C8762] bg-opacity-10 border-[#6C8762] text-[#6C8762]"
                      : "bg-white border-gray-300 hover:border-[#6C8762]"
                  )}
                >
                  <img
                    src={getPaymentMethodIcon(method.icon)}
                    alt={method.name}
                    className="w-6 h-6"
                  />
                  <div>
                    <Text className="font-medium">{method.name}</Text>
                    {method.id === "CASH" && (
                      <Text className="text-sm text-gray-600">
                        Pagamento realizado na barbearia
                      </Text>
                    )}
                  </div>
                  <div className="ml-auto">
                    <input
                      type="radio"
                      checked={selectedPaymentMethod === method.id}
                      readOnly
                      className="radio radio-success"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Informações importantes */}
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <img
                src={getIcons("info")}
                alt="Info"
                className="w-5 h-5 mt-0.5"
              />
              <div>
                <Text className="font-medium text-yellow-800 mb-1">
                  Informações importantes:
                </Text>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Agendamentos podem ser cancelados gratuitamente até 24h antes</li>
                  <li>• Após este prazo, será cobrada taxa de 50% do valor</li>
                  <li>• Chegue 5 minutos antes do horário marcado</li>
                  <li>• Você receberá uma confirmação por WhatsApp</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Espaçador para o botão fixo */}
          <div className="h-24" />
        </div>

        {/* Botão de confirmação fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-4 pb-6 px-4">
          <Button
            type="button"
            className="max-w-80 m-auto h-14 w-full"
            onClick={handleConfirmPayment}
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                Processando...
              </div>
            ) : (
              `Confirmar e ${selectedPaymentMethod === "CASH" ? "Agendar" : "Pagar"} • ${formatter({
                type: "pt-BR",
                currency: "BRL",
                style: "currency",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(bookingData.totalPrice)}`
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};