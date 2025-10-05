import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { IOrder } from "@/utils/types";
import { getIcons } from "@/assets/icons";
import { getServices } from "@/assets/services";
import { useOrders } from "@/hooks/useOrders";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { CircleIcon, Loading } from "@/components/elements";
import { formatCustomDateTime, formatter } from "@/utils/utils";

export const DetailsOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDate, setEditDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [order, setOrder] = useState<IOrder | null>(null);
  const { orders, cancelOrder, loading, fetchOrders } = useOrders();

  useEffect(() => {
    // Carregar pedidos se ainda não carregou
    if (!orders.length) {
      fetchOrders();
    }
  }, [fetchOrders, orders.length]);

  useEffect(() => {
    // Encontrar o pedido pelo ID
    if (id && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === id);
      if (foundOrder) {
        console.log('📦 Order encontrado:', foundOrder);
        setOrder(foundOrder);
        setEditDate(foundOrder.start_time);
      } else {
        console.warn('⚠️ Order não encontrado:', id);
      }
    }
  }, [id, orders]);

  const handleCancelOrder = async () => {
    if (order && window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await cancelOrder(order.id);
        navigate("/mybookings");
      } catch (error) {
        console.error('Error canceling order:', error);
      }
    }
  };

  const handleSaveChanges = async () => {
    // TODO: Implement order update when API is ready
    console.log('Save changes for order:', order?.id);
    setIsEditing(false);
  };

  if (loading && !order) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <Header title={"Detalhes"} backPath={"/mybookings"} />
        <div className="flex items-center justify-center h-full">
          <p>Agendamento não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Detalhes"} backPath={"/mybookings"} />

        <div className="flex flex-col w-full justify-start items-start gap-2.5 px-4 overflow-auto h-[calc(100vh-145px)]">
          {/* Status e Ações */}
          <div className="w-full bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold">Status:</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  order.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "cancelled" || order.status === "canceled"
                    ? "bg-red-100 text-red-800"
                    : order.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status === "confirmed"
                  ? "Confirmado"
                  : order.status === "cancelled" || order.status === "canceled"
                  ? "Cancelado"
                  : order.status === "completed"
                  ? "Concluído"
                  : "Pendente"}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(order.status === "confirmed" || order.status === "pending") && (
                <>
                  {order.status === "pending" && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-1 min-w-[120px]"
                    >
                      {isEditing ? "Cancelar Edição" : "Editar Data"}
                    </button>
                  )}
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-1 min-w-[120px]"
                  >
                    Cancelar Agendamento
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Edição de Data */}
          {isEditing && (
            <div className="w-full bg-white p-4 rounded-lg shadow mb-4">
              <label className="block mb-2 font-bold">Nova Data e Hora:</label>
              <input
                type="datetime-local"
                value={editDate ? editDate.substring(0, 16) : ""}
                onChange={(e) =>
                  setEditDate(new Date(e.target.value).toISOString())
                }
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end mt-3 gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          {/* Detalhes do Agendamento */}
          <AnimatePresence>
            {order.services?.map((service: any, index: number) => {
              // Função para mapear nome do serviço para ícone local (igual ao SwipeableCard)
              const getServiceIconByName = (serviceName: string): string => {
                const nameMap: { [key: string]: string } = {
                  'corte de cabelo': 'haircuts',
                  'corte': 'haircuts',
                  'cabelo': 'haircuts',
                  'barba': 'beard',
                  'sobrancelha': 'eyebrow',
                  'infantil': 'kids_cuts',
                  'criança': 'kids_cuts',
                  'reflexo': 'reflex',
                  'pigmentação': 'pigmentation',
                  'tesoura': 'scissor_cut',
                  'maquina': 'electric_razor_cut',
                  'máquina': 'electric_razor_cut',
                };

                const lowerName = serviceName.toLowerCase();
                for (const [key, icon] of Object.entries(nameMap)) {
                  if (lowerName.includes(key)) {
                    return getServices(icon as any);
                  }
                }
                return getIcons("fallback");
              };

              const serviceIcon = service.service_icon || getServiceIconByName(service.service_name);

              return (
                <motion.div
                  key={index}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  exit={{
                    y: -50,
                    opacity: 0,
                    transition: { duration: 0.3 },
                  }}
                  transition={{
                    damping: 10,
                    type: "spring",
                    stiffness: 120,
                  }}
                  className="w-full"
                >
                  <div className="flex flex-col py-2.5 px-3.5 justify-between items-center self-stretch rounded-md bg-white shadow-lg relative">
                    <CircleIcon className="w-32 h-32 my-auto overflow-hidden">
                      <img
                        alt="Image service"
                        src={serviceIcon}
                        className="w-[calc(100%-25px)] h-[calc(100%-25px)] object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getIcons("fallback");
                        }}
                      />
                    </CircleIcon>

                    <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-3 mt-4">
                      <p className="text-[#6B7280] dm_sans text-base font-light">
                        {order.barber?.name || "Barbeiro não especificado"}
                      </p>
                      <h2 className="text-[#494949] dm_sans textarea-lg font-medium leading-normal">
                        {service.service_name}
                      </h2>

                      <p className="flex items-center gap-[1.5px] text-[#6B7280] dm_sans text-base">
                        <img
                          className="size-5"
                          alt="Icon location"
                          src={getIcons("location_outlined_green")}
                        />
                        Barbearia faz milagres
                      </p>

                      <p className="flex items-center gap-1.5 text-[#6B7280] dm_sans text-base">
                        <img
                          alt="Icon calendar"
                          className="size-5"
                          src={getIcons("calendar_tick")}
                        />
                        <div className="h-3 w-[0.5px] bg-[#6C8760] rounded-3xl" />
                        {formatCustomDateTime(new Date(order.start_time))}
                      </p>

                      <div className="w-full flex justify-between items-center">
                        <h2 className="text-[#494949] dm_sans text-base font-medium">
                          {formatter({
                            type: "pt-BR",
                            currency: "BRL",
                            style: "currency",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(service.service_price || 0)}
                        </h2>

                        <span className="text-sm text-gray-500">
                          Duração: {service.service_duration || 0} minutos
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Informações de Pagamento */}
          <div className="w-full bg-white p-4 rounded-lg shadow mt-4">
            <h3 className="font-bold mb-3">Informações de Pagamento</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    order.services.reduce((sum, s) => sum + (s.service_price || 0), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Método de Pagamento:</span>
                <span className="font-medium">
                  {order.payment_method === "PIX"
                    ? "PIX"
                    : order.payment_method === "DEBIT"
                    ? "Cartão de Débito"
                    : order.payment_method === "CREDIT"
                    ? "Cartão de Crédito"
                    : order.payment_method || "Não especificado"}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto:</span>
                  <span className="font-medium">
                    -{formatter({
                      type: "pt-BR",
                      currency: "BRL",
                      style: "currency",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-lg">
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(order.final_amount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
