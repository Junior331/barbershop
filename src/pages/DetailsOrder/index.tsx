import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { formatCustomDateTime, formatter } from "@/utils/utils";
import { useOrderActions, useOrderStore } from "@/store/useOrderStore";

export const DetailsOrder = () => {
  const { id } = useParams();
  const orders = useOrderStore((state) => state.orders);
  const { toggleService } = useOrderActions();

  const order = orders.find((order) => order.id === id);

  const handleDelete = (serviceId: number) => {
    toggleService({
      time: 0,
      name: "",
      icon: "",
      price: 0,
      id: serviceId,
    });
  };

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Editar"} backPath={"/mybookings"} />
        <div className="flex flex-col w-full justify-start items-start gap-2.5 px-4 overflow-auto h-[calc(100vh-145px)]">
          <AnimatePresence>
            {order.services.map((service) => (
              <motion.div
                key={service.id}
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
                  <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-3">
                    <p className="text-[#6B7280] dm_sans text-base font-light ">
                      {order.barber.name}
                    </p>
                    <h2 className="text-[#494949] dm_sans textarea-lg font-medium leading-normal">
                      {service.name}
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
                      <div className="h-3 w-[0.5px] bg-[#6B7280] rounded-3xl" />
                      {formatCustomDateTime(order.date || "")}
                    </p>
                    <h2 className="self-stretch text-[#494949] dm_sans text-base not-italic dm_sansfont-medium leading-[19.5px]">
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
        </div>
      </div>
    </Layout>
  );
};
