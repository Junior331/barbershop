import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
import { Loading } from "@/components/elements";

export const Confirm = () => {
  const navigate = useNavigate();
  const { services } = useOrder();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const { addOrder, toggleService, setPaymentMethod } = useOrderActions();

  const currentOrder = useOrder();

  const handleDelete = (serviceId: number) => {
    toggleService({
      time: 0,
      name: "",
      icon: "",
      price: 0,
      id: serviceId,
    });
  };

  const paymentMethods = [
    { id: "pix", name: "Pix", fee: 0.01 },
    { id: "debit_card", name: "Cartão de Débito", fee: 0.03 },
    { id: "credit_card", name: "Cartão de Crédito", fee: 0.084 },
  ];

  const handleConfirm = () => {
    if (selectedMethod) {
      setPaymentMethod(selectedMethod);
      setIsOpen(false);
    }
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve("Success");
          } else {
            reject(new Error("Payment processing failed"));
          }
        }, 2000);
      });

      const newOrder: Order = {
        ...currentOrder,
        id: uuidv4(),
        status: "confirmed",
        date: currentOrder.date || new Date().toISOString(),
      };

      addOrder(newOrder);
      navigate("/mybookings");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
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
            {services.map((service) => (
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
                  className="flex flex-col py-2.5 px-3.5 justify-between items-center self-stretch rounded-md bg-white shadow-lg relative"
                >
                  <div className="size-32 p-5 bg-[#FEFEFE] rounded-[70px] border-2 border-white shadow-[0px_1px_4px_0px_rgba(156,163,175,0.40)]">
                    <img
                      alt="Image avatar"
                      src={service.icon}
                      className="size-full "
                    />
                  </div>
                  <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-3">
                    <p className="text-[#6B7280] dm_sans text-base font-light ">
                      {currentOrder.barber.name}
                    </p>
                    <h2 className="text-[#494949] dm_sans textarea-lg font-medium ">
                      {service.name}
                    </h2>

                    <p className="flex items-center gap-[1.5px] text-[#6B7280] dm_sans text-base">
                      <img
                        alt="Icon location"
                        className="size-5"
                        src={getIcons("location_outlined_green")}
                      />
                      Barbearia faz milagres
                    </p>
                    <p className="flex items-center gap-1 text-[#6B7280] dm_sans text-base">
                      <img
                        alt="Icon calendar"
                        className="size-5"
                        src={getIcons("calendar_tick")}
                      />
                      <div className="h-3 w-[0.5px] bg-[#6B7280] rounded-3xl" />
                      {formatCustomDateTime(currentOrder.date || "")}
                    </p>
                    <h2 className="self-stretch text-[#494949] dm_sans text-base not-italic dm_sansfont-medium ">
                      {formatter({
                        type: "pt-BR",
                        currency: "BRL",
                        style: "currency",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(service.price || 0)}{" "}
                    </h2>
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

          <h2 className="text-black inter text-[18px] font-medium tracking-[1.2px]">
            Resumo dos serviços
          </h2>
          <div className="flex flex-col gap-2 py-6 px-3.5 justify-between items-center self-stretch rounded-md bg-white shadow-lg">
            <div className="flex justify-between items-center w-full">
              <p className="text-[#181D27] opacity-60 dm_sans text-base font-normal ">
                SubTotal
              </p>
              <h2 className="text-[#181D27] dm_sans textarea-lg font-medium ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(currentOrder.subTotal || 0)}{" "}
              </h2>
            </div>
            <div className="flex justify-between items-center w-full">
              <p className="text-[#181D27] opacity-60 dm_sans text-base font-normal ">
                Payment fee
              </p>
              <p className="text-[#181D27] opacity-60 dm_sans text-base font-normal ">
                {formatPercentage(currentOrder.paymentFee)}
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <p className="text-[#181D27] opacity-60 dm_sans text-base font-normal ">
                Payment method
              </p>

              <p
                className="text-[#9938FC] dm_sans text-base font-normal tracking-wide"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                Visa **** 3708
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <p className="text-[#181D27] opacity-60 dm_sans text-base font-normal ">
                Promotion discount
              </p>
              <p className="text-[#181D27] opacity-60 dm_sans text-base font-normal ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(currentOrder.discount || 0)}{" "}
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-[#181D27] dm_sans textarea-lg font-medium ">
                Total
              </h2>
              <h2 className="text-[#181D27] dm_sans textarea-lg font-medium ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(currentOrder.total || 0)}{" "}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleFinalConfirm}
              className="btn mt-5 w-full max-w-full border-none bg-[#6B7280] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
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
                  onClick={handleConfirm}
                  className="btn w-full max-w-full border-none bg-[#6B7280] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
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
