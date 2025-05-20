import { useMemo } from "react";
import { isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { useOrderStore } from "@/store/useOrderStore";
import { Card, Header, SwipeableCard } from "@/components/organisms";
import { formatDateTime, formatter, getCurrentDate } from "@/utils/utils";

export const MyBookings = () => {
  const navigate = useNavigate();
  const { dayOfWeek, formattedDate } = getCurrentDate();
  const orders = useOrderStore((state) => state.orders);

  const processedOrders = useMemo(
    () =>
      orders.map((order) => {
        const serviceDate = new Date(order.date || "");
        const currentDate = new Date();

        serviceDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        const isCompleted = isBefore(serviceDate, currentDate);

        return { ...order, isCompleted };
      }),
    [orders]
  );

  const dotsArray = Array.from({ length: 20 });

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Minha Agenda"} backPath={"/"} />
        <div className="flex flex-col justify-start items-center h-full w-full p-4 pr-2 pt-2">
          <div className="flex w-full gap-3 mb-4">
            <div className="w-[71px] h-[71px] flex justify-center items-center rounded-[71px]  bg-[#6B7280] border-2 border-white filter drop-shadow-[0px_2px_4px_rgba(112,121,116,0.30)]">
              <img src={getIcons("calendar_solid_white")} alt="Icon calendar" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-black inter text-base font-medium leading-normal">
                {dayOfWeek}
              </p>
              <h2 className="text-black inter textarea-xl font-bold leading-normal">
                {formattedDate}
              </h2>
            </div>
          </div>

          <div className="flex flex-1 flex-col w-full h-full items-start justify-start overflow-y-auto pr-2 pb-[50px]">
            {processedOrders.length ? (
              <>
                {processedOrders
                  .filter((order) => !order.isCompleted)
                  .map((order) => (
                    <SwipeableCard key={order.id} item={order} />
                  ))}

                {Boolean(
                  processedOrders.filter((order) => order.isCompleted).length
                ) && (
                  <div className="flex gap-0.5 justify-center items-center w-full min-h-10 overflow-hidden">
                    {dotsArray.map((_, index) => (
                      <div
                        key={`left-${index}`}
                        className="min-w-1 min-h-1 rounded bg-[#000]"
                      ></div>
                    ))}
                    <div className="w-[136px] h-[29px]  rounded-[25px] bg-white shadow-[0px_4px_4px_0px_rgba(50,183,104,0.15)] flex justify-center items-center mx-1.5">
                      <h2 className="text-black font-roboto text-[16px] font-medium leading-none">
                        Finalizado
                      </h2>
                    </div>
                    {dotsArray.map((_, index) => (
                      <div
                        key={`right-${index}`}
                        className="min-w-1 min-h-1 rounded bg-[#000]"
                      ></div>
                    ))}
                  </div>
                )}

                {processedOrders
                  .filter((order) => order.isCompleted)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="btn w-full h-auto bg-transparent border-0 shadow-none p-0 filter"
                    >
                      <Card
                        style={{
                          padding: 11.5,
                          paddingLeft: 2,
                          minWidth: "100%",
                          minHeight: "initial",
                        }}
                      >
                        <div className="flex items-center w-full h-full">
                          <img
                            src={
                              order.services[0]?.icon || getIcons("fallback")
                            }
                            alt={`Service ${order.services[0]?.name}`}
                            className="w-[87px] h-[87px]"
                          />
                          <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                            <p className="text-[#6B7280] inter text-[13px] font-bold leading-[150%] truncate max-w-[calc(100vw-32px)]">
                              {order.services.map((s) => s.name).join(", ")}
                            </p>
                            <p className="text-[#6B7280] inter text-[8px] font-[300] leading-none">
                              <strong className="font-bold text-[11px]">
                                Total:{" "}
                              </strong>
                              {formatter({
                                type: "pt-BR",
                                currency: "BRL",
                                style: "currency",
                              }).format(order.total)}
                            </p>
                            <p className="text-[#6B7280] inter text-[8px] font-[300] leading-none">
                              <strong className="font-bold text-[11px]">
                                Date:{" "}
                              </strong>
                              {formatDateTime(order.date || "", "date")} at{" "}
                              {formatDateTime(order.date || "", "time")}
                            </p>
                            <p className="text-[#6B7280] inter text-[8px] font-[300] leading-none">
                              <strong className="font-bold text-[11px]">
                                Barber:{" "}
                              </strong>
                              {order.barber.name}
                            </p>
                            <p className="text-[#6B7280] inter text-[8px] font-[300] leading-none">
                              <strong className="font-bold text-[11px]">
                                Status:{" "}
                              </strong>
                              {order.status}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
              </>
            ) : (
              <div className="flex flex-col gap-4 w-full items-center justify-center text-center p-6 px-2">
                <div className="space-y-2">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    className="flex justify-center mb-4"
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <img
                      className="size-24"
                      alt="Icon barber apron"
                      src={getIcons("barber")}
                    />
                  </motion.div>

                  <h2 className="inter textarea-xl font-semibold text-gray-700">
                    Nenhum serviço agendado!
                  </h2>
                  <p className="inter text-gray-500 text-base">
                    Que tal marcar seu primeiro serviço?
                  </p>
                </div>

                <motion.button
                  className="flex items-center justify-center px-6 py-3 font-medium text-white rounded-lg shadow-lg bg-gradient-to-r bg-[#6b7280] focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                  initial={{ boxShadow: "0 0 0 0 rgba(156,163,175, 0.7)" }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(156,163,175, 0.7)",
                      "0 0 0 10px rgba(156,163,175, 0)",
                      "0 0 0 0 rgba(156,163,175, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  onClick={() => navigate("/services")}
                >
                  Agendar agora
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
