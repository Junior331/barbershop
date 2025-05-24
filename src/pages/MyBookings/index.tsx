import { isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { getIcons } from "@/assets/icons";
import { useOrders } from "@/hooks/useOrders";
import { Layout } from "@/components/templates";
import { getServices } from "@/assets/services";
import { Card, Header, SwipeableCard } from "@/components/organisms";
import {
  Text,
  Title,
  Loading,
  CircleIcon,
  StatusBadge,
} from "@/components/elements";
import { formatCustomDateTime, formatter, getCurrentDate } from "@/utils/utils";

export const MyBookings = () => {
  const navigate = useNavigate();
  const { dayOfWeek, formattedDate } = getCurrentDate();
  const { orders, loading, fetchOrders, cancelOrder, deleteOrder } =
    useOrders();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const processedOrders = useMemo(
    () =>
      orders.map((order) => {
        const serviceDate = new Date(order.date || "");
        const currentDate = new Date();

        serviceDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        const isCompleted =
          isBefore(serviceDate, currentDate) ||
          order.status === "completed" ||
          order.status === "canceled";

        return { ...order, isCompleted };
      }),
    [orders]
  );

  const handleCancelOrder = async (orderId: string) => {
    const success = await cancelOrder(orderId);
    if (success) {
      // Atualizar a lista ou mostrar feedback
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const success = await deleteOrder(orderId);
    if (success) {
      // Atualizar a lista ou mostrar feedback
      fetchOrders();
    }
  };

  const dotsArray = Array.from({ length: 20 });

  if (loading && !orders.length) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Minha Agenda"} backPath={"/"} />
        <div className="flex flex-col justify-start items-center h-full w-full p-4 pr-2 pt-2">
          <div className="flex w-full gap-3 mb-4">
            <CircleIcon>
              <img src={getIcons("calendar_solid_white")} alt="Icon calendar" />
            </CircleIcon>
            <div className="flex flex-col justify-center">
              <p className="text-black inter text-base font-medium leading-normal">
                {dayOfWeek}
              </p>
              <h2 className="text-black inter textarea-xl font-bold leading-normal">
                {formattedDate}
              </h2>
            </div>
          </div>

          <div className="flex flex-1 flex-col w-full h-full items-start justify-start overflow-y-auto pr-2 pb-[50px] gap-3.5">
            {processedOrders.length ? (
              <>
                {processedOrders
                  .filter((order) => !order.isCompleted)
                  .map((order) => (
                    <SwipeableCard
                      item={order}
                      key={order.id}
                      onCancel={() => handleCancelOrder(order.id)}
                      onDelete={() => handleDeleteOrder(order.id)}
                    />
                  ))}

                {Boolean(
                  processedOrders.filter((order) => order.isCompleted).length
                ) && (
                  <div className="flex gap-0.5 justify-center items-center w-full min-h-10 overflow-hidden my-3">
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
                          padding: 21.5,
                          paddingLeft: 2,
                          minWidth: "100%",
                          position: "relative",
                          minHeight: "initial",
                        }}
                      >
                        <div className="flex items-center w-full h-full pl-4">
                          <CircleIcon className="min-w-[87px] h-[87px] my-auto overflow-hidden">
                            <img
                              src={
                                order.services[0]?.icon ||
                                getServices("fallback")
                              }
                              alt={`Service ${order.services[0]?.name}`}
                              className="w-[calc(100%-25px)] h-[calc(100%-25px)] object-cover"
                            />
                          </CircleIcon>
                          <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2 relative">
                            <Title className="font-bold leading-[150%] truncate max-w-[calc(100vw-32px)]">
                              {order.services.map((s) => s.name).join(", ")}
                            </Title>

                            <Text className="font-[300] leading-none">
                              <strong className="font-bold text-[#111827] textarea-sm">
                                Date:{" "}
                              </strong>
                              {formatCustomDateTime(order.date || "")}
                            </Text>
                            <Text className="font-[300] leading-none">
                              <strong className="font-bold text-[#111827] textarea-sm">
                                Barber:{" "}
                              </strong>
                              {order.barber.name}
                            </Text>
                          </div>

                          <div className="flex flex-col items-center gap-[5px] absolute bottom-5 right-5">
                            <Title className="textarea-md font-[300] ">
                              {formatter({
                                type: "pt-BR",
                                currency: "BRL",
                                style: "currency",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(order.total_price || 0)}
                            </Title>
                          </div>

                          <StatusBadge
                            variant="outline"
                            status={order.status}
                            className="capitalize p-2.5 absolute top-5 right-5"
                          />
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
                  className="flex items-center justify-center px-6 py-3 font-medium text-white rounded-lg shadow-lg bg-gradient-to-r bg-[#6C8762] focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
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
