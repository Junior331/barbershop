/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { getIcons } from "@/assets/icons";
import { Header } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { useOrder } from "@/store/useOrderStore";
import {
  formatter,
  formatPercentage,
  formatCustomDateTime,
  getPaymentMethodIcon,
} from "@/utils/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { CircleIcon, Loading, Text, Title } from "@/components/elements";

export const Confirm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentOrder = useOrder();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Calcular totais quando os serviços mudam
  useEffect(() => {
    currentOrder.calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrder.services, currentOrder.promotionCode]);

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
    { id: "pix", name: "Pix", fee: 0.01, icon: "pix" },
    {
      id: "debit_card",
      name: "Cartão de Débito",
      fee: 0.03,
      icon: "debit_card",
    },
    {
      id: "credit_card",
      name: "Cartão de Crédito",
      fee: 0.084,
      icon: "credit_card",
    },
    { id: "wallet", name: "Carteira", fee: 0, icon: "wallet" },
  ];

  const handleApplyPromoCode = async () => {
    if (!promoCode) return;

    try {
      setLoading(true);
      // Verificar promoção no Supabase
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("code", promoCode)
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .lte("start_date", new Date().toISOString())
        .single();

      if (error) throw error;
      if (!data) throw new Error("Código promocional inválido ou expirado");

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

      // Preparar dados para a RPC
      const servicesData = currentOrder.services.map((service) => ({
        id: service.id,
        price: service.price,
        duration: service.durationMinutes,
      }));

      // Converter a data e hora para o formato correto
      const startDateTime = new Date(currentOrder.date);
      const [hours, minutes] = currentOrder.startTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Chamar a função RPC
      const { error } = await supabase.rpc("create_appointment_with_services", {
        client_id: user.id,
        notes: currentOrder.notes,
        services_data: servicesData,
        final_amount: currentOrder.total,
        barber_id: currentOrder.barber.id,
        start_time: startDateTime.toISOString(),
        payment_method: currentOrder.paymentMethod,
        promotion_code: currentOrder.promotionCode,
        appointment_date: currentOrder.date.toISOString().split("T")[0],
      });

      if (error) throw error;

      // Limpar o pedido após sucesso
      currentOrder.clearOrder();

      // Redirecionar com mensagem de sucesso
      toast.success("Agendamento confirmado com sucesso!");
      navigate("/mybookings");
    } catch (error: any) {
      toast.error(error.message || "Erro ao confirmar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    currentOrder.setPaymentMethod(methodId);
    currentOrder.calculateTotals(); // Adicione esta linha
    setIsPaymentModalOpen(false);
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
                        }).format(service.price || 0)}
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

            <h3 className="font-bold text-lg mb-4">
              Selecione o Método de Pagamento
            </h3>

            <div className="space-y-3">
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
          </div>
        </dialog>

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
