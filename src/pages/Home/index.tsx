import { motion } from "framer-motion";

import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { Card } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { barbers, orders, promotionsWeek } from "./utils";

export const Home = () => {
  return (
    <Layout>
      <div className="flex flex-col pt-[27px] px-3 pr-1 justify-start items-start h-screen w-full">
        <div className="w-full mb-6">
          <h2 className="font-[300] flex flex-col text-[#283046] max-w-[145px] inter text-[32px] leading-[36px]">
            Hi,
            <span className="font-bold">Junior</span>
          </h2>
        </div>

        <div className="flex flex-1 flex-col w-full h-full items-start justify-start overflow-y-auto pb-20">
          <div className="flex flex-col items-center w-full pr-2">
            <div className="flex items-center justify-between w-full gap-1">
              <label className="text-[#000] inter text-base font-bold leading-[150%]">
                Promotions of week
              </label>
              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline text-[#000] font-[500] text-[15px] inter"
              >
                see all
              </button>
            </div>

            <div className="flex items-center justify-start w-full overflow-auto max-w-full gap-[10px] pb-[10px]">
              {promotionsWeek.map((item) => {
                return (
                  <Card>
                    <img
                      src={item.icon}
                      alt={`Service ${item.name}`}
                      className="w-[45px] h-[45px] mx-auto"
                    />
                    <div className="flex-1 flex flex-col justify-end w-full h-full">
                      <p className="text-white font-inter text-[9px] font-bold leading-none">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.price || 0)}
                      </p>
                      <p className="text-white font-inter text-[9px] font-bold leading-none truncate max-w-[80px]">
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
              <label className="text-[#000] inter text-base font-bold leading-[150%]">
                Your orders
              </label>
              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline text-[#000] font-[500] text-[15px] inter"
              >
                see all
              </button>
            </div>

            <div className="flex items-center justify-start w-full overflow-auto max-w-full gap-[10px] pb-[10px]">
              {orders.map((item) => {
                return (
                  <div className="btn w-[203px] h-auto bg-transparent border-0 shadow-none p-0">
                    <Card
                      style={{
                        minWidth: 203,
                        paddingLeft: 2,
                        minHeight: "initial",
                      }}
                    >
                      <div className="flex items-center w-full h-full">
                        <img
                          src={item.icon}
                          alt={`Service ${item.name}`}
                          className="w-[60px] h-[60px]"
                        />

                        <div className="flex flex-col justify-start items-start w-full gap-[3px] flex-grow pl-2">
                          <p className="text-white font-inter text-[13px] font-bold leading-[150%] border-b border-[#E5E7EB]">
                            {item.name}
                          </p>
                          <p className="text-white font-roboto text-[8px] font-normal leading-none">
                            {item.barber}
                          </p>
                          <p className="flex items-center gap-[1.5px] text-white font-inter text-[6.5px] font-normal leading-0">
                            <img
                              alt="Icon location"
                              src={getIcons("location_outlined")}
                            />
                            {item.location}
                          </p>
                          <p className="flex items-center gap-[2.5px] text-white font-inter text-[6.5px] font-normal leading-0">
                            <img
                              alt="Icon location"
                              src={getIcons("clock_outlined")}
                            />
                            <div className="h-[7px] w-[1.5px] bg-white" />
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
              <label className="text-[#000] inter text-base font-bold leading-[150%]">
                Barbers
              </label>
              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline text-[#000] font-[500] text-[15px] inter pr-2"
              >
                see all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[5px] w-full overflow-auto max-w-full pb-[10px] 5 pr-1">
              {barbers.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="btn w-full h-auto bg-transparent border-0 shadow-none p-0"
                  >
                    <Card
                      style={{
                        padding: 0,
                        minWidth: "100%",
                        overflow: "hidden",
                        minHeight: "initial",
                      }}
                    >
                      <div className="flex items-center w-full h-full pr-[5px]">
                        <img
                          src={item.image}
                          alt={`Barber ${item.name}`}
                          className="min-w-[66px] min-h-[70px] max-w-[66px] max-h-[70px] object-cover border-r-[2px] border-[#E5E7EB]"
                        />

                        <div className="flex flex-col justify-start items-start w-full gap-[3px] flex-grow pl-2">
                          <p className="w-full text-start text-white font-inter text-[13px] font-bold leading-[150%] border-b border-[#E5E7EB] text_ellipsis">
                            {item.name}
                          </p>
                          <p className="text-white font-roboto text-[8px] font-normal leading-none">
                            {item.type}
                          </p>
                          <p className="flex items-center gap-[1.5px] text-white font-inter text-[6.5px] font-normal leading-0">
                            <img
                              alt="Icon location"
                              src={getIcons("location_outlined")}
                            />
                            {item.location}
                          </p>
                          <div className="flex items-center gap-[3px]">
                            <img
                              alt="Icon location"
                              src={getIcons("star_solid")}
                              className="relative top-[-1px]"
                            />
                            <p className="flex items-center gap-[2.5px] text-white font-inter text-[6.5px] font-normal leading-0">
                              {item.rating}
                            </p>
                            <div className="h-[7px] w-[0.5px] bg-white" />
                            <p className="flex items-center gap-[2.5px] text-white font-inter text-[6.5px] font-normal leading-0">
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
          >
            Agendar
            <span className="absolute top-0 left-0 w-full h-full rounded-lg opacity-0 hover:opacity-20 bg-white transition-opacity duration-300"></span>
          </motion.button>
        </div>
      </div>
    </Layout>
  );
};
