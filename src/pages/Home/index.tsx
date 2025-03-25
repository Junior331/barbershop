import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { Card } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { barbers, orders, promotionsWeek } from "./utils";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="bg-[#f7f8fde8] w-screen h-screen fixed top-[180px]" />
      <div className="flex flex-col pt-[27px] px-3 pr-1 justify-start items-start h-screen w-full">
        <div className="w-full mb-6">
          <h2 className="font-[300] flex flex-col text-[#283046] max-w-[145px] inter text-[32px] leading-[36px]">
            Olá,
            <span className="font-bold">Junior</span>
          </h2>
        </div>

        <div className="flex flex-1 flex-col w-full h-full items-start justify-start overflow-y-auto pb-20 z-10">
          <div className="flex flex-col items-center w-full pr-2">
            <div className="flex items-center justify-between w-full gap-1">
              <label className="text-[#000] inter textarea-lg font-bold leading-[150%]">
                Promoções da semana
              </label>
            </div>

            <div className="flex items-center justify-start w-full overflow-auto max-w-full gap-[10px] pb-[10px]">
              {promotionsWeek.map((item) => {
                return (
                  <Card
                    style={{
                      minWidth: 110,
                      minHeight: 120,
                      paddingLeft: 8,
                    }}
                  >
                    <img
                      src={item.icon}
                      alt={`Service ${item.name}`}
                      className="w-[calc(100%-25px)] h-[calc(100%-25px)] mx-auto"
                    />
                    <div className="flex-1 flex flex-col justify-end w-full h-full gap-2 mt-2">
                      <p className="text-[#6b7280] inter text-[14px] font-bold leading-none">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.price || 0)}
                      </p>
                      <p className="text-[#6b7280] inter text-[14px] font-bold leading-none truncate max-w-[80px]">
                        {item.name}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center w-full mt-5 pr-2">
            <div className="flex items-center justify-between w-full gap-1">
              <label className="text-[#000] inter textarea-lg font-bold leading-[150%]">
                Seus serviços
              </label>
              <button
                type="button"
                onClick={() => navigate("/myBookings")}
                className="btn p-0 m-0 btn-link border-none !no-underline text-[#000] font-[500] text-[14px] inter"
              >
                Ver mais
              </button>
            </div>

            <div className="flex items-center justify-start w-full overflow-auto max-w-full gap-[10px] pb-[10px]">
              {orders.map((item) => {
                return (
                  <div className="btn w-[300px] h-auto bg-transparent border-0 shadow-none p-0">
                    <Card
                      style={{
                        minWidth: 300,
                        paddingLeft: 2,
                        minHeight: "initial",
                      }}
                    >
                      <div className="flex items-center w-full h-full">
                        <img
                          src={item.icon}
                          alt={`Service ${item.name}`}
                          className="w-[90px] h-[90px]"
                        />

                        <div className="flex flex-col justify-start items-start w-full gap-[8px] flex-grow pl-2">
                          <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold leading-[150%] border-b border-[#E5E7EB]">
                            {item.name}
                          </p>
                          <p className="text-[#6b7280] font-roboto textarea-md font-normal leading-none">
                            {item.barber}
                          </p>
                          <p className="flex items-center gap-[1.5px] text-[#6b7280] inter textarea-md font-normal">
                            <img
                              className="size-4"
                              alt="Icon location"
                              src={getIcons("location_outlined_green")}
                            />
                            {item.location}
                          </p>
                          <p className="flex items-center gap-2 text-[#6b7280] inter textarea-md font-normal">
                            <img
                              alt="Icon clock"
                              className="size-4"
                              src={getIcons("clock_outlined_green")}
                            />
                            <div className="h-3 w-[1.5px] bg-[#6b7280]" />
                            {item.time}min
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center w-full mt-5">
            <div className="flex items-center justify-between w-full gap-1">
              <label className="text-[#000] inter textarea-lg font-bold leading-[150%]">
                Barbeiros
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full overflow-auto max-w-full pb-[10px] 5 pr-1">
              {barbers.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="btn w-full h-auto bg-transparent border-0 shadow-none p-0"
                  >
                    <Card
                      style={{
                        padding: 0,
                        minHeight: 130,
                        minWidth: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <div className="flex items-center w-full h-full pr-[5px] min-h-28">
                        <img
                          src={item.image}
                          alt={`Barber ${item.name}`}
                          className="min-w-32 min-h-32 max-w-32 max-h-32 object-cover"
                        />

                        <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                          <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold leading-[150%] border-b border-[#9CA3AF] text_ellipsis">
                            {item.name}
                          </p>
                          <p className="text-[#6b7280] font-roboto textarea-md font-normal leading-none">
                            {item.type}
                          </p>
                          <p className="flex items-center gap-[1.5px] text-[#6b7280] inter textarea-md font-normal">
                            <img
                              alt="Icon location"
                              src={getIcons("location_outlined_green")}
                              className="size-4"
                            />
                            {item.location}
                          </p>
                          <div className="flex items-center gap-[3px]">
                            <img
                              alt="Icon star"
                              src={getIcons("star_solid_green")}
                              className="size-4 relative top-[-1px]"
                            />
                            <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                              {item.rating}
                            </p>
                            <div className="h-[7px] w-[0.5px] bg-[#6b7280]" />
                            <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                              {item.cuts} Cuts
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.button
            className="fixed bottom-24 right-2 flex items-center justify-center border border-white px-6 py-3 font-medium text-white rounded-lg shadow-lg bg-gradient-to-r bg-[#6b7280] focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
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
            Agendar
          </motion.button>
        </div>
      </div>
    </Layout>
  );
};
