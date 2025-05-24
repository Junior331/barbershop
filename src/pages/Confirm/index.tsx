import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Order } from "@/utils/types";
import { getIcons } from "@/assets/icons";
import { Header } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { useOrder, useOrderActions } from "@/store/useOrderStore";
import {
  formatter,
  formatPercentage,
  formatCustomDateTime,
} from "@/utils/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { CircleIcon, Loading, Text, Title } from "@/components/elements";

export const Confirm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentOrder = useOrder();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addOrder, toggleService } = useOrderActions();
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const handleDelete = (serviceId: number) => {
    toggleService({
      time: 0,
      name: "",
      icon: "",
      price: 0,
      discount: 0,
      id: serviceId,
      public: false,
      created_at: "",
    });
  };

  const paymentMethods = [
    { id: "pix", name: "Pix", fee: 0.01 },
    { id: "debit_card", name: "Cartão de Débito", fee: 0.03 },
    { id: "credit_card", name: "Cartão de Crédito", fee: 0.084 },
  ];

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (
        !currentOrder.barber?.id ||
        !currentOrder.date ||
        currentOrder.services.length === 0
      ) {
        throw new Error("Dados incompletos para o agendamento");
      }

      const totalDuration = currentOrder.services.reduce((acc, service) => {
        return acc + (service.time || 30); // 30 minutos como padrão se não houver duration
      }, 0);

      const { data, error } = await supabase
        .from("schedules")
        .insert([
          {
            barber_id: currentOrder.barber.id,
            client_id: user.id,
            date_time: currentOrder.date,
            service_id: currentOrder.services[0].id,
            time: totalDuration,
            status: "confirmed",
            payment_method: selectedMethod,
            payment_fee: currentOrder.paymentFee,
            total_price: currentOrder.total,
          },
        ])
        .select();

      if (error) throw error;

      const newOrder: Order = {
        ...currentOrder,
        id: data[0].id,
        status: "confirmed",
        date: currentOrder.date,
      };

      addOrder(newOrder);
      navigate("/mybookings");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao confirmar agendamento, tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Confirm"} backPath={"/calendar"} />

        <div className="flex flex-col w-full justify-start items-start gap-2.5 px-4 overflow-auto h-[calc(100vh-145px)]">
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
                <div
                  key={service.id}
                  className="flex py-2.5 px-3.5 justify-between items-center self-stretch rounded-md bg-white shadow-lg relative"
                >
                  <CircleIcon className="min-w-32 h-32 my-auto overflow-hidden">
                    <img
                      src={service.icon}
                      alt={`Service ${service.name}`}
                      className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                    />
                  </CircleIcon>

                  <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-1">
                    <Text className="text-[#6B7280] dm_sans text-base font-light ">
                      {currentOrder.barber.name}
                    </Text>
                    <Title className="dm_sans textarea-lg font-medium ">
                      {service.name}
                    </Title>

                    <Text className="flex items-center gap-[1.5px] text-[#6B7280] dm_sans text-base">
                      <img
                        alt="Icon location"
                        className="size-5"
                        src={getIcons("location_outlined_green")}
                      />
                      Barbearia faz milagres
                    </Text>
                    <Text className="flex items-center gap-1 text-[#6B7280] dm_sans text-base">
                      <img
                        alt="Icon calendar"
                        className="size-5"
                        src={getIcons("calendar_tick")}
                      />
                      <div className="h-3 w-[0.5px] bg-[#6C8762] rounded-3xl" />
                      {formatCustomDateTime(currentOrder.date || "")}
                    </Text>
                    <div className="flex flex-col items-center gap-[5px] absolute right-4 bottom-4">
                      {Boolean(service.discount) && (
                        <Text className="line-through">
                          {formatter({
                            type: "pt-BR",
                            currency: "BRL",
                            style: "currency",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(
                            service.price / (1 - (service?.discount || 1) / 100)
                          )}
                        </Text>
                      )}
                      <Title className="inter textarea-md font-[300] leading-none ">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(service.price || 0)}
                      </Title>
                    </div>
                  </div>

                  <button
                    className="cursor-pointer absolute top-4 right-4"
                    onClick={() => handleDelete(service.id)}
                  >
                    <img
                      alt="Delete icon"
                      className="size-8"
                      src={getIcons("trash_red")}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Title className="tracking-[1.2px]">Resumo dos serviços</Title>
          <div className="flex flex-col gap-2 py-6 px-3.5 justify-between items-center self-stretch rounded-md bg-white shadow-lg">
            <div className="flex justify-between items-center w-full">
              <Text className="opacity-60 dm_sans text-base font-normal ">
                SubTotal
              </Text>
              <Title className="dm_sans textarea-lg font-medium ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(currentOrder.subTotal || 0)}{" "}
              </Title>
            </div>
            <div className="flex justify-between items-center w-full">
              <Text className="opacity-60 dm_sans text-base font-normal ">
                Payment fee
              </Text>
              <Text className="opacity-60 dm_sans text-base font-normal ">
                {formatPercentage(currentOrder.paymentFee)}
              </Text>
            </div>
            <div className="flex justify-between items-center w-full">
              <Text className="opacity-60 dm_sans text-base font-normal ">
                Payment method
              </Text>

              <Text
                className="text-[#9938FC] dm_sans text-base font-normal tracking-wide"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                Visa **** 3708
              </Text>
            </div>
            <div className="flex justify-between items-center w-full">
              <Text className="opacity-60 dm_sans text-base font-normal ">
                Promotion discount
              </Text>
              <Text className="text-[#181D27] opacity-60 dm_sans text-base font-normal ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(currentOrder.discount || 0)}{" "}
              </Text>
            </div>
            <div className="flex justify-between items-center w-full">
              <Title className="dm_sans textarea-lg font-medium ">Total</Title>
              <Title className="dm_sans textarea-lg font-medium ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(currentOrder.total || 0)}{" "}
              </Title>
            </div>

            <button
              type="button"
              onClick={handleFinalConfirm}
              className="btn mt-5 w-full max-w-full border-none bg-[#6C8762] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
            >
              Confirm
            </button>
          </div>
        </div>

        <dialog open={isOpen} className="modal">
          <div className="modal-box bg-white w-96 max-w-[calc(100vw-32px)]">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <h3 className="font-bold text-lg mb-4">Método de pagamento</h3>

            <form method="dialog" className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className="mb-2.5 flex w-full h-12 px-4 items-center justify-between border border-[#D8D6DE] rounded-[4px] hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex w-full justify-between items-center gap-3">
                    <span className="text-[#181D27]">{method.name}</span>

                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      className="radio radio-primary radio-sm border border-[#6E6B7B] custom_input_radio"
                    />
                  </div>
                </div>
              ))}

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="btn w-full max-w-full border-none bg-[#6C8762] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
                  disabled={!selectedMethod}
                >
                  Confirmar Método
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {loading && <Loading />}
      </div>
    </Layout>
  );
};
