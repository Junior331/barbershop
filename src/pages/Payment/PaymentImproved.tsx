import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { cn, formatter, getPaymentMethodIcon } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { Card, Header, AddCardModal } from "@/components/organisms";
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
import { useAuth } from "@/context/AuthContext";

type PaymentMethod = 'CREDIT' | 'DEBIT' | 'PIX' | 'CASH' | 'WALLET';

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault?: boolean;
}

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
  const { user } = useAuth();
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

  // Cartões salvos
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Carregar cartões salvos quando selecionar crédito ou débito
  const loadSavedCards = async () => {
    if (!user?.sub) {
      console.log('❌ User não está logado, não pode carregar cartões');
      return;
    }

    console.log('🔄 Carregando cartões salvos para user:', user.sub);
    setLoadingCards(true);
    try {
      const cards = await paymentsService.getPaymentMethods(user.sub);
      console.log('✅ Cartões carregados:', cards);
      setSavedCards(cards);

      // Selecionar cartão padrão automaticamente
      const defaultCard = cards.find((card: SavedCard) => card.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard.id);
        console.log('✅ Cartão padrão selecionado:', defaultCard.id);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cartões:', error);
      toast.error('Erro ao carregar cartões salvos');
    } finally {
      setLoadingCards(false);
    }
  };

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

    // Carregar cartões se CREDIT está selecionado por padrão
    console.log('🔄 useEffect - Verificando se deve carregar cartões');
    console.log('selectedPaymentMethod:', selectedPaymentMethod);
    console.log('user:', user);

    if (selectedPaymentMethod === 'CREDIT' || selectedPaymentMethod === 'DEBIT') {
      console.log('✅ Método de pagamento é cartão, carregando cartões...');
      loadSavedCards();
    }
  }, [navigate, user]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);

    // Carregar cartões salvos quando selecionar crédito ou débito
    if ((method === 'CREDIT' || method === 'DEBIT') && savedCards.length === 0) {
      loadSavedCards();
    }
  };

  const handleAddCard = async (cardData: any) => {
    if (!user?.sub) return;

    try {
      await paymentsService.addPaymentMethod(user.sub, cardData);
      toast.success('Cartão adicionado com sucesso!');
      await loadSavedCards(); // Recarregar lista
      setShowAddCardModal(false);
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      toast.error('Erro ao adicionar cartão');
      throw error;
    }
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

    // ✅ VALIDAR ANTES de criar agendamento
    if ((selectedPaymentMethod === 'CREDIT' || selectedPaymentMethod === 'DEBIT') && !selectedCard) {
      toast.error('Por favor, selecione um cartão ou adicione um novo');
      return;
    }

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
        console.log('💳 Entering CARD payment flow');
        console.log('🔐 Device ID:', deviceId);
        console.log('🃏 Selected Card:', selectedCard);

        // 💳 CARD: Usar cartão salvo para pagamento
        toast.loading('Processando pagamento...', { id: 'card-loading' });

        try {
          const cardPayment = await paymentsService.createCardPayment({
            appointmentId: appointmentId,
            amount: bookingData.totalPrice,
            cardToken: selectedCard ?? '', // Usar o ID do cartão salvo como token
            description: `Agendamento - ${bookingData.selectedServices.map(s => s.name).join(', ')}`,
            installments: 1,
          });

          console.log('✅ Pagamento com cartão processado:', cardPayment);

          if (cardPayment.status === 'approved' || cardPayment.status === 'paid') {
            toast.success('Pagamento aprovado!', { id: 'card-loading' });

            // Limpar localStorage de booking
            localStorage.removeItem('selectedServices');
            localStorage.removeItem('bookingData');
            localStorage.removeItem('finalBookingData');

            navigate(`/booking-confirmation/${appointmentId}`);
          } else if (cardPayment.status === 'pending') {
            toast('Pagamento em análise. Aguarde a confirmação.', { id: 'card-loading' });

            // Limpar localStorage de booking
            localStorage.removeItem('selectedServices');
            localStorage.removeItem('bookingData');
            localStorage.removeItem('finalBookingData');

            navigate(`/payment-pending/${appointmentId}`);
          } else {
            throw new Error('Pagamento não aprovado');
          }
        } catch (error: any) {
          console.error('❌ Erro no pagamento com cartão:', error);
          toast.error(error.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.', { id: 'card-loading' });
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

          {/* Cartões Salvos (mostrar apenas quando crédito ou débito estiver selecionado) */}
          {(selectedPaymentMethod === 'CREDIT' || selectedPaymentMethod === 'DEBIT') && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <Title>Selecione um cartão:</Title>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="flex items-center gap-2 text-[#6C8762] font-medium text-sm hover:underline"
                >
                  <img src={getIcons("card_add")} alt="Adicionar" className="w-5 h-5" />
                  Adicionar cartão
                </button>
              </div>

              {loadingCards ? (
                <div className="flex justify-center py-4">
                  <div className="loading loading-spinner loading-md"></div>
                </div>
              ) : savedCards.length > 0 ? (
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCard(card.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border text-left transition-colors",
                        selectedCard === card.id
                          ? "bg-[#6C8762] bg-opacity-10 border-[#6C8762]"
                          : "bg-white border-gray-300 hover:border-[#6C8762]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPaymentMethodIcon("card_credit")}
                            alt="Cartão"
                            className="w-8 h-8"
                          />
                          <div>
                            <Text className="font-medium">
                              {card.brand} •••• {card.last4}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              {card.cardholderName}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              Validade: {card.expiryMonth}/{card.expiryYear}
                            </Text>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={selectedCard === card.id}
                          readOnly
                          className="radio radio-success"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Card className="w-full p-6">
                  <div className="text-center">
                    <img
                      src={getIcons("card_add")}
                      alt="Sem cartões"
                      className="w-16 h-16 mx-auto mb-3 opacity-50"
                    />
                    <Text className="text-gray-600 mb-3">
                      Você ainda não tem cartões salvos
                    </Text>
                    <button
                      onClick={() => setShowAddCardModal(true)}
                      className="px-4 py-2 bg-[#6C8762] text-white rounded-lg text-sm font-medium hover:bg-[#5a6f52]"
                    >
                      Adicionar primeiro cartão
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Modal para adicionar cartão */}
          {showAddCardModal && (
            <AddCardModal
              isOpen={showAddCardModal}
              onClose={() => setShowAddCardModal(false)}
              addPaymentMethod={handleAddCard}
            />
          )}

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