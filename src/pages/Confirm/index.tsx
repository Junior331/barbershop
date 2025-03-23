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
  const { date, services } = useOrder();
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
      date: "",
      price: 0,
      barber: "",
      location: "",
      id: serviceId,
      status: "pending"
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
                  className="flex py-2.5 px-3.5 justify-between items-center self-stretch rounded-md bg-white shadow-lg"
                >
                  <img
                    alt="Image avatar"
                    src={service.icon}
                    className="object-scale-down w-[71px] h-[71px] p-1.5 bg-[#6B7280] flex-shrink-0 rounded-[70px] border-2 border-white filter drop-shadow-[0_2px_4px_rgba(112,121,116,0.30)]"
                  />
                  <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-1">
                    <p className="flex flex-col justify-center flex-shrink-0 text-[#6B7280] dm_sans text-[8px] font-light ">
                      {service.barber}
                    </p>
                    <h2 className="flex flex-col justify-center flex-shrink-0 text-[#494949] dm_sans text-[13px] font-medium ">
                      {service.name}
                    </h2>

                    <p className="flex items-center gap-[1.5px] text-[#6B7280] dm_sans text-[8px]">
                      <img
                        alt="Icon location"
                        src={getIcons("location_outlined_green")}
                      />
                      Barbearia faz milagres
                    </p>
                    <p className="flex items-center gap-1.5 text-[#6B7280] dm_sans text-[8px]">
                      <img
                        alt="Icon location"
                        src={getIcons("calendar_tick")}
                      />
                      <div className="h-[6px] w-[0.5px] bg-[#6B7280] rounded-3xl" />
                      {formatCustomDateTime(date || "")}
                    </p>
                  </div>

                  <div className="flex flex-col w-fit min-w-[41px] min-h-[51px] items-end h-full justify-between">
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="cursor-pointer"
                    >
                      <img
                        className="size-3.5"
                        alt="Delete icon"
                        src={getIcons("trash_red")}
                      />
                    </button>
                    <h2 className="self-stretch text-[#494949] font-dm-sans text-[9px] not-italic font-medium leading-[19.5px]">
                      {formatter({
                        type: "pt-BR",
                        currency: "BRL",
                        style: "currency",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(service.price || 0)}{" "}
                    </h2>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <h2 className="text-black inter text-[18px] font-medium leading-normal tracking-[1.2px]">
            Summary of services
          </h2>
          <div className="flex flex-col gap-2.5 py-2.5 px-3.5 justify-between items-center self-stretch rounded-md bg-white shadow-lg">
            <div className="flex justify-between items-center w-full">
              <p className="text-[#181D27] opacity-60 dm_sans text-[11px] font-normal leading-[16px]">
                SubTotal
              </p>
              <h2 className="text-[#181D27] dm_sans text-[13px] font-medium leading-[19.5px]">
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
              <p className="text-[#181D27] opacity-60 dm_sans text-[11px] font-normal leading-[16px]">
                Payment fee
              </p>
              <p className="text-[#181D27] opacity-60 dm_sans text-[11px] font-normal leading-[16px]">
                {formatPercentage(currentOrder.paymentFee)}
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <p className="text-[#181D27] opacity-60 dm_sans text-[11px] font-normal leading-[16px]">
                Payment method
              </p>

              <button
                className="btn bg-transparent border-0 shadow-none p-0 "
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <p className="text-[#9938FC] dm_sans text-[11px] font-normal leading-[16px]">
                  Visa **** 3708
                </p>
              </button>
            </div>
            <div className="flex justify-between items-center w-full">
              <p className="text-[#181D27] opacity-60 dm_sans text-[11px] font-normal leading-[16px]">
                Promotion discount
              </p>
              <p className="text-[#181D27] opacity-60 dm_sans text-[11px] font-normal leading-[16px]">
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
              <h2 className="text-[#181D27] dm_sans text-[13px] font-medium leading-[19.5px]">
                Total
              </h2>
              <h2 className="text-[#181D27] dm_sans text-[13px] font-medium leading-[19.5px]">
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
