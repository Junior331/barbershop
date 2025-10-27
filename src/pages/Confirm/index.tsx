/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { getIcons } from "@/assets/icons";
import { Header, AddCardModal } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { useOrder } from "@/store/useOrderStore";
import {
  formatter,
  formatPercentage,
  formatCustomDateTime,
  getPaymentMethodIcon,
  cn,
} from "@/utils/utils";
import { useAuth } from "@/context/AuthContext";
import { CircleIcon, Loading, Text, Title } from "@/components/elements";
import { appointmentsService, paymentsService } from "@/services";
import { logger } from "@/utils/logger";

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault?: boolean;
}

export const Confirm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentOrder = useOrder();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Estados para cartões salvos
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Calcular totais quando os serviços mudam
  useEffect(() => {
    currentOrder.calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrder.services, currentOrder.promotionCode]);

  // Carregar cartões salvos quando selecionar crédito ou débito
  const loadSavedCards = async () => {
    if (!user?.id) {
      console.log('❌ User não está logado, não pode carregar cartões');
      return;
    }

    console.log('🔄 Carregando cartões salvos para user:', user.id);
    setLoadingCards(true);
    try {
      const cards = await paymentsService.getPaymentMethods(user.id);
      console.log('✅ Cartões carregados do backend:', cards);
      console.log('✅ Quantidade de cartões:', cards.length);
      setSavedCards(cards);

      // Selecionar cartão padrão automaticamente
      const defaultCard = cards.find((card: SavedCard) => card.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard.id);
        console.log('✅ Cartão padrão selecionado:', defaultCard.id);
      } else {
        console.log('ℹ️ Nenhum cartão padrão encontrado');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar cartões:', error);
      console.error('❌ Resposta do servidor:', error.response?.data);
      toast.error('Erro ao carregar cartões salvos');
    } finally {
      setLoadingCards(false);
    }
  };

  const handleAddCard = async (cardData: any) => {
    if (!user?.id) {
      console.error('❌ User não está logado');
      return;
    }

    console.log('🔵 Iniciando adição de cartão:', cardData);
    console.log('🔵 User ID:', user.id);

    try {
      const result = await paymentsService.addPaymentMethod(user.id, cardData);
      console.log('✅ Cartão adicionado no backend:', result);

      toast.success('Cartão adicionado com sucesso!');

      console.log('🔄 Recarregando lista de cartões...');
      await loadSavedCards(); // Recarregar lista

      setShowAddCardModal(false);
      setIsPaymentModalOpen(true); // Reabrir modal de pagamento
    } catch (error: any) {
      console.error('❌ Erro ao adicionar cartão:', error);
      console.error('❌ Resposta do servidor:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erro ao adicionar cartão');
      throw error;
    }
  };

  const handleOpenAddCardModal = () => {
    setIsPaymentModalOpen(false); // Fechar modal de pagamento
    setShowAddCardModal(true); // Abrir modal de adicionar cartão
  };

  const handleCloseAddCardModal = () => {
    setShowAddCardModal(false);
    setIsPaymentModalOpen(true); // Reabrir modal de pagamento
  };

  // Carregar cartões quando o método de pagamento mudar para CREDIT ou DEBIT
  useEffect(() => {
    if ((currentOrder.paymentMethod === 'CREDIT' || currentOrder.paymentMethod === 'DEBIT') && savedCards.length === 0) {
      loadSavedCards();
    }
  }, [currentOrder.paymentMethod]);

  const handleDeleteService = (serviceId: string) => {
    currentOrder.toggleService({
      id: serviceId,
      name: "",
      price: 0,
      discount: 0,
      imageUrl: "",
      createdAt: "",
      updatedAt: "",
      barberShopId: "",
      description: "",
      durationMinutes: 0,
    });
  };

  const paymentMethods = [
    { id: "PIX", name: "Pix", fee: 0.01, icon: "pix" },
    {
      id: "DEBIT",
      name: "Cartão de Débito",
      fee: 0.03,
      icon: "debit_card",
    },
    {
      id: "CREDIT",
      name: "Cartão de Crédito",
      fee: 0.084,
      icon: "credit_card",
    },
    { id: "WALLET", name: "Carteira", fee: 0, icon: "wallet" },
  ];

  const handleApplyPromoCode = async () => {
    if (!promoCode) return;

    try {
      setLoading(true);
      // TODO: Implementar verificação de promoção com backend
      // Por enquanto, aceitar qualquer código para teste
      currentOrder.setPromotionCode(promoCode);
      toast.success("Código promocional aplicado com sucesso!");
      setIsPromoModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao aplicar código promocional");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async () => {
    // ✅ VALIDAR CARTÃO ANTES de processar
    if ((currentOrder.paymentMethod === 'CREDIT' || currentOrder.paymentMethod === 'DEBIT') && !selectedCard) {
      toast.error('Por favor, selecione um cartão ou adicione um novo');
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (
        !currentOrder.barber?.id ||
        !currentOrder.date ||
        !currentOrder.startTime ||
        currentOrder.services.length === 0 ||
        !currentOrder.paymentMethod
      ) {
        throw new Error("Dados incompletos para o agendamento");
      }

      // Converter a data e hora para o formato correto
      const startDateTime = new Date(currentOrder.date);
      const [hours, minutes] = currentOrder.startTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Garantir que a data está no futuro
      const now = new Date();
      if (startDateTime <= now) {
        throw new Error("A data e hora selecionadas devem estar no futuro");
      }

      // Criar agendamento com o primeiro serviço (o backend atual espera um serviço por vez)
      const firstService = currentOrder.services[0];

      // Obter barberShopId - pode vir do barbeiro ou do serviço
      let barberShopId = currentOrder.barber.barberShop?.id;

      // Se não tiver no barbeiro, pegar do serviço (todos os serviços são da mesma barbearia)
      if (!barberShopId && firstService.barberShop?.id) {
        barberShopId = firstService.barberShop.id;
      }

      if (!barberShopId) {
        throw new Error("Não foi possível identificar a barbearia. Por favor, tente novamente.");
      }

      // Formatar data no formato ISO-8601 correto
      const scheduledToISO = startDateTime.toISOString();

      // Log para debug
      logger.info('Criando agendamento:', {
        scheduledTo: scheduledToISO,
        barberId: currentOrder.barber.id,
        serviceId: firstService.id,
        barberShopId: barberShopId,
      });

      const appointmentData: any = {
        clientId: user.id,
        barberId: currentOrder.barber.id,
        serviceId: firstService.id,
        barberShopId: barberShopId,
        scheduledTo: scheduledToISO,
        totalPrice: currentOrder.total ?? 0,
      };
      console.log('🚀 appointmentData ::', appointmentData);

      // Adicionar campos opcionais apenas se tiverem valor
      if (currentOrder.paymentMethod) {
        appointmentData.paymentMethod = currentOrder.paymentMethod;
      }
      if (currentOrder.notes) {
        appointmentData.notes = currentOrder.notes;
      }

      // NOVO FLUXO: Criar appointment PRIMEIRO com status PENDING

      logger.info('Criando appointment com status PENDING...');

      // Criar appointment com status PENDING
      const createdAppointment = await appointmentsService.create({
        ...appointmentData,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      });

      logger.info('Appointment criado:', createdAppointment);

      // Criar pagamento usando Checkout Transparente (PIX = QR Code in-app)
      if (currentOrder.paymentMethod === 'PIX') {
        try {
          // ✅ PIX: Usar Checkout Transparente - Mostrar QR Code no app
          const pixPayment = await paymentsService.createPixPayment({
            appointmentId: createdAppointment.id,
            amount: currentOrder.total ?? 0,
            description: `Agendamento de ${currentOrder.services.map(s => s.name).join(', ')}`,
            metadata: {
              deviceId: 'unknown',
              source: 'confirm-page',
            }
          });

          console.log('✅ PIX Payment criado:', pixPayment);
          console.log('📱 QR Code disponível:', !!pixPayment.qrCodeBase64);
          logger.info('✅ PIX Payment criado:', pixPayment);
          logger.info('📱 QR Code disponível:', !!pixPayment.qrCodeBase64);

          // Validar que temos QR Code
          if (pixPayment.qrCode && pixPayment.qrCodeBase64) {
            // Limpar pedido antes de navegar
            currentOrder.clearOrder();

            toast.success('Código PIX gerado com sucesso!');

            // Navegar para página de QR Code
            navigate(`/payment/pix/${createdAppointment.id}`, {
              state: {
                paymentId: pixPayment.id,
                appointmentId: createdAppointment.id,
                amount: currentOrder.total ?? 0,
                qrCode: pixPayment.qrCode,
                qrCodeBase64: pixPayment.qrCodeBase64,
                services: currentOrder.services.map(s => s.name).join(', '),
              }
            });
          } else {
            console.error('❌ QR Code não gerado:', pixPayment);
            toast.error('Erro: QR Code PIX não foi gerado. Tente novamente.');
          }
        } catch (error: any) {
          console.error('❌ Erro ao criar pagamento PIX:', error);
          logger.error('Erro ao criar pagamento PIX:', error);
          toast.error('Erro ao criar pagamento PIX. Tente novamente.');
          throw error;
        }
      }
      // Cartão: Processar pagamento com cartão salvo
      else if (currentOrder.paymentMethod === 'CREDIT' || currentOrder.paymentMethod === 'DEBIT') {
        console.log('💳 Processando pagamento com cartão salvo:', selectedCard);

        try {
          const cardPayment = await paymentsService.createCardPayment({
            appointmentId: createdAppointment.id,
            amount: currentOrder.total || 0,
            cardToken: selectedCard!, // Usar o ID do cartão salvo
            description: `Agendamento - ${currentOrder.services.map(s => s.name).join(', ')}`,
            installments: 1,
          });

          console.log('✅ Pagamento com cartão processado:', cardPayment);

          if (cardPayment.status === 'approved' || cardPayment.status === 'paid') {
            toast.success('Pagamento aprovado!');
            currentOrder.clearOrder();
            navigate(`/booking-confirmation/${createdAppointment.id}`);
          } else if (cardPayment.status === 'pending') {
            toast('Pagamento em análise. Aguarde a confirmação.');
            currentOrder.clearOrder();
            navigate(`/payment/pending`);
          } else {
            throw new Error('Pagamento não aprovado');
          }
        } catch (error: any) {
          console.error('❌ Erro ao processar pagamento com cartão:', error);
          toast.error(error.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.');
          throw error;
        }
      }
      // Outros métodos (WALLET)
      else {
        currentOrder.clearOrder();
        toast.success('Agendamento confirmado!');
        navigate(`/booking-confirmation/${createdAppointment.id}`);
      }
    } catch (error: any) {
      console.error('Erro ao confirmar agendamento:', error);
      toast.error(error.response?.data?.message || error.message || "Erro ao confirmar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    currentOrder.setPaymentMethod(methodId);
    currentOrder.calculateTotals();

    // Resetar cartão selecionado quando mudar de método
    setSelectedCard(null);

    // NÃO fechar modal automaticamente - usuário precisa confirmar o cartão
  };

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Confirmar Agendamento"} backPath={"/calendar"} />

        <div className="flex flex-col w-full justify-start items-start gap-4 px-4 overflow-auto h-[calc(100vh-145px)] pb-4">
          <AnimatePresence>
            {currentOrder.services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -50,
                  transition: { duration: 0.3 },
                }}
                transition={{
                  damping: 10,
                  type: "spring",
                  stiffness: 120,
                }}
                className="w-full"
              >
                <div className="flex flex-col py-3 px-4 justify-between items-center self-stretch rounded-md bg-white shadow-lg relative">
                  <CircleIcon className="min-w-32 h-32 my-auto overflow-hidden">
                    <img
                      src={service.imageUrl || getIcons("fallback")}
                      alt={`Service ${service.name}`}
                      className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                    />
                  </CircleIcon>

                  <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-1 mt-2">
                    <Text className="text-[#6B7280] dm_sans text-base font-light">
                      {currentOrder.barber?.name || "Barbeiro não selecionado"}
                    </Text>
                    <Title className="dm_sans text-lg font-medium">
                      {service.name}
                    </Title>

                    <Text className="flex items-center gap-1.5 text-[#6B7280] dm_sans text-base">
                      <img
                        alt="Icon calendar"
                        className="size-5"
                        src={getIcons("calendar_tick")}
                      />
                      {currentOrder.date && currentOrder.startTime
                        ? formatCustomDateTime(
                            new Date(
                              currentOrder.date.getFullYear(),
                              currentOrder.date.getMonth(),
                              currentOrder.date.getDate(),
                              parseInt(currentOrder.startTime.split(":")[0]),
                              parseInt(currentOrder.startTime.split(":")[1])
                            )
                          )
                        : "Data/hora não selecionada"}
                    </Text>

                    <div className="flex flex-col items-center gap-1 absolute right-4 bottom-4">
                      <Title className="inter text-lg font-medium">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(service.pricing?.finalPrice ?? service.price ?? 0)}
                      </Title>
                      <Text className="text-sm text-gray-500">
                        {service.durationMinutes} min
                      </Text>
                    </div>
                  </div>

                  <button
                    className="cursor-pointer absolute top-4 right-4"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <img
                      alt="Delete icon"
                      className="size-6"
                      src={getIcons("trash_red")}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Resumo do Pedido */}
          <div className="w-full bg-white rounded-md shadow-lg p-4">
            <Title className="text-lg mb-4">Resumo do Pedido</Title>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Text className="text-gray-600">Subtotal</Text>
                <Text>
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                  }).format(currentOrder.subtotal || 0)}
                </Text>
              </div>

              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <Text>Desconto</Text>
                  <Text>
                    -
                    {formatter({
                      type: "pt-BR",
                      currency: "BRL",
                      style: "currency",
                    }).format(currentOrder.discount || 0)}
                  </Text>
                </div>
              )}

              {currentOrder.paymentMethod && currentOrder.paymentFee > 0 && (
                <div className="flex justify-between">
                  <Text className="text-gray-600">Taxa de Pagamento</Text>
                  <Text>
                    {formatter({
                      type: "pt-BR",
                      currency: "BRL",
                      style: "currency",
                    }).format(currentOrder.paymentFee || 0)}
                  </Text>
                </div>
              )}

              <div className="flex justify-between">
                <Text className="text-gray-600">Método de Pagamento</Text>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-purple-600 underline"
                >
                  {currentOrder.paymentMethod
                    ? paymentMethods.find(
                        (m) => m.id === currentOrder.paymentMethod
                      )?.name
                    : "Selecionar"}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <Text>Total</Text>
                  <Title>
                    {formatter({
                      type: "pt-BR",
                      currency: "BRL",
                      style: "currency",
                    }).format(currentOrder.total || 0)}
                  </Title>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmAppointment}
              disabled={
                !currentOrder.paymentMethod ||
                currentOrder.services.length === 0 ||
                !currentOrder.date ||
                !currentOrder.startTime ||
                !currentOrder.barber
              }
              className="btn mt-6 w-full max-w-full border-none bg-[#6C8762] disabled:bg-gray-300 rounded text-[14px] text-white py-[10px] font-[500] tracking-[0.4px]"
            >
              Confirmar Agendamento
            </button>
          </div>
        </div>

        {/* Modal de Métodos de Pagamento */}
        <dialog open={isPaymentModalOpen} className="modal">
          <div className="modal-box bg-white max-w-md">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <h2 className="font-bold text-lg mb-4">
              Selecione o Método de Pagamento
            </h2>

            <div className="flex flex-col space-y-3 gap-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => handleSelectPaymentMethod(method.id)}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    currentOrder.paymentMethod === method.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    alt={method.name}
                    className="w-8 h-8 mr-3"
                    src={getIcons(getPaymentMethodIcon(method.icon))}
                  />
                  <div className="flex-1">
                    <Text className="font-medium">{method.name}</Text>
                    <Text className="text-sm text-gray-500">
                      Taxa: {formatPercentage(method.fee)}
                    </Text>
                  </div>
                  <input
                    type="radio"
                    checked={currentOrder.paymentMethod === method.id}
                    onChange={() => {}}
                    className="radio radio-primary !bg-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Seção de Cartões Salvos */}
            {(currentOrder.paymentMethod === 'CREDIT' || currentOrder.paymentMethod === 'DEBIT') && (
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-md">Selecione um cartão:</h3>
                  <button
                    type="button"
                    onClick={handleOpenAddCardModal}
                    className="text-[#6C8762] font-medium text-sm hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar
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
                          "w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-3",
                          selectedCard === card.id
                            ? "bg-[#6C8762] bg-opacity-10 border-[#6C8762]"
                            : "bg-white border-gray-300 hover:border-[#6C8762]"
                        )}
                      >
                        <img
                          src={getIcons(getPaymentMethodIcon("credit_card"))}
                          alt="Cartão"
                          className="w-8 h-8"
                        />
                        <div className="flex-1">
                          <Text className="font-medium text-sm">
                            {card.brand} •••• {card.last4}
                          </Text>
                          <Text className="text-xs text-gray-600">
                            {card.cardholderName}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            Val: {card.expiryMonth}/{card.expiryYear}
                          </Text>
                        </div>
                        <input
                          type="radio"
                          checked={selectedCard === card.id}
                          readOnly
                          className="radio radio-success"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <Text className="text-gray-600 mb-3">
                      Você ainda não tem cartões salvos
                    </Text>
                    <button
                      type="button"
                      onClick={handleOpenAddCardModal}
                      className="px-4 py-2 bg-[#6C8762] text-white rounded-lg text-sm font-medium hover:bg-[#5a6f52]"
                    >
                      Adicionar primeiro cartão
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Validar se método foi selecionado
                  if (!currentOrder.paymentMethod) {
                    toast.error('Selecione um método de pagamento');
                    return;
                  }

                  // Validar cartão se for CREDIT ou DEBIT
                  if ((currentOrder.paymentMethod === 'CREDIT' || currentOrder.paymentMethod === 'DEBIT') && !selectedCard) {
                    toast.error('Selecione um cartão');
                    return;
                  }

                  // Fechar modal
                  setIsPaymentModalOpen(false);
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-[#6C8762] text-white font-medium hover:bg-[#5a6f52] transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </dialog>

        {/* Modal para Adicionar Cartão */}
        {showAddCardModal && (
          <AddCardModal
            isOpen={showAddCardModal}
            onClose={handleCloseAddCardModal}
            addPaymentMethod={handleAddCard}
          />
        )}

        {/* Modal de Código Promocional */}
        <dialog open={isPromoModalOpen} className="modal">
          <div className="modal-box bg-white max-w-md">
            <button
              onClick={() => setIsPromoModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <h3 className="font-bold text-lg mb-4">
              Aplicar Código Promocional
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <Text className="label-text">Código Promocional</Text>
                </label>
                <input
                  type="text"
                  placeholder="Digite o código"
                  className="input input-bordered w-full"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>

              <button
                onClick={handleApplyPromoCode}
                disabled={!promoCode || loading}
                className="btn w-full bg-primary disabled:bg-gray-300 text-white"
              >
                {loading ? "Aplicando..." : "Aplicar Código"}
              </button>

              {currentOrder.promotionCode && (
                <div className="alert alert-success">
                  <div>
                    <span>Código aplicado: {currentOrder.promotionCode}</span>
                    <button
                      onClick={() => {
                        currentOrder.setPromotionCode(null);
                        setPromoCode("");
                      }}
                      className="btn btn-xs btn-error ml-2"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </dialog>

        {loading && <Loading />}
      </div>
    </Layout>
  );
};
