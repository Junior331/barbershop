import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { useAuth } from "@/context/AuthContext";
import { capitalizeName, cn, formatter } from "@/utils/utils";
import { useHome } from "./useHome";
import { Text, Title, Loading, CircleIcon } from "@/components/elements";
import { getServices } from "@/assets/services";
import { Card } from "@/components/organisms";

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, hasPromotions, hasAppointments, hasBarbers, handleImageLoad, imageLoadingStates, handleImageError } = useHome();

  return (
    <Layout>
      <div className="bg-[#f7f8fde8] w-screen h-screen fixed top-[180px]" />
      <div className="flex flex-col pt-[27px] px-2 justify-start items-start h-full w-full relative">
        {/* Header */}
        <div className="w-full mb-6">
          <h2 className="font-[300] flex flex-col text-[#283046] max-w-[145px] inter text-[26px] leading-[36px]">
            Olá,
            <Title className="!text-3xl !text-[#566F4C]">
              {capitalizeName(user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuário")}
            </Title>
          </h2>
        </div>

        <div className="flex flex-1 flex-col w-full h-full items-start justify-start overflow-y-auto pb-20 z-1">
          {/* Promoções da semana */}
          <div className="flex flex-col mb-6 w-full">
            <div className="flex items-center justify-between mb-3">
              <Title className="text-lg font-bold text-black">Promoções da semana</Title>
              <button
                onClick={() => navigate("/services")}
                className="text-sm text-gray-600"
              >
                Ver mais
              </button>
            </div>

            <div className="flex gap-2 space-x-3 overflow-x-auto pb-2">
              {loading.promotions ? (
                <div className="flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasPromotions ? (
                data.promotions.slice(0, 5).map((service) => {
                  const displayPrice = service.promotionalPrice || service.price;
                  const isImageLoading = imageLoadingStates[service.id];

                  return (
                    <div
                      key={service.id}
                      className="flex-shrink-0 w-24 h-auto bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex flex-col items-center cursor-pointer"
                      onClick={() => navigate("/services")}
                    >
                      <CircleIcon className="!max-w-32 !max-h-32">
                        {isImageLoading && (
                          <div className="size-full flex items-center justify-center">
                            <div className="loading loading-spinner text-white"></div>
                          </div>
                        )}

                        <img
                          onLoad={() => handleImageLoad(service.id)}
                          alt={`Service ${service.name}`}
                          src={service.imageUrl || getIcons("fallback")}
                          onError={(e) => handleImageError(e, service.id)}
                          className={cn(
                            "w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover",
                            isImageLoading && "hidden"
                          )}
                        />
                      </CircleIcon>
                      <div className="flex-1 flex flex-col justify-end w-full h-full gap-2 mt-2">
                        <Text className="text-xs !font-bold">
                          {formatter({
                            type: "pt-BR",
                            currency: "BRL",
                            style: "currency",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(displayPrice || 0)}
                        </Text>
                        <Text className="text-xs text-gray-600 truncate w-full">
                          {service.name}
                        </Text>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center w-full py-8">
                  <Text className="text-gray-500">Nenhuma promoção disponível</Text>
                </div>
              )}
            </div>
          </div>

          {/* Your orders */}
          <div className="flex flex-col mb-6 w-full">
            <div className="flex items-center justify-between mb-3">
              <Title className="text-lg font-bold text-black">Seus agendamentos</Title>
              <button
                onClick={() => navigate("/mybookings")}
                className="text-sm text-gray-600"
              >
                Ver mais
              </button>
            </div>

            <div className="flex gap-2 space-x-3 overflow-x-auto pb-2">
              {loading.appointments ? (
                <div className="flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasAppointments ? (
                data.appointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
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
                      <div className="flex items-center w-full h-full px-3 min-h-28 my-auto">
                        <CircleIcon className="min-w-24 h-24 my-auto overflow-hidden">
                          <img
                            alt={appointment.service?.name || 'Serviço'}
                            className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                            src={appointment.service?.imageUrl || getServices("fallback")}
                            onError={(e) => {
                              e.currentTarget.src = getServices("fallback");
                            }}
                          />
                        </CircleIcon>

                        <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                          <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold leading-[150%] border-b border-gray-100 truncate">
                            {appointment.service.name}
                          </p>
                          <p className="text-[#6b7280] font-roboto textarea-md font-normal leading-none">
                            {appointment.barber.name}

                          </p>
                          <p className="flex items-center gap-[1.5px] text-[#6b7280] inter textarea-md font-normal">
                            <img
                              alt="Icon location"
                              src={getIcons("location_outlined_green")}
                              className="size-4"
                            />
                            {appointment.barberShop?.name || ''}
                          </p>
                          <p className="flex items-center gap-[1.5px] text-[#6b7280] inter textarea-md font-normal">
                            <img
                              alt="Icon location"
                              src={getIcons("clock_outlined_green")}
                              className="size-4"
                            />
                            {appointment.service.durationMinutes || ''}min
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Text className="text-gray-500 text-center mb-4">
                    Você não tem agendamentos ativos
                  </Text>
                  <button
                    onClick={() => navigate("/services")}
                    className="px-4 py-2 bg-[#6C8762] text-white rounded-lg text-sm"
                  >
                    Fazer agendamento
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Barbeiros */}
          <div className="flex flex-col mb-6 w-full">
            <div className="flex items-center justify-between mb-3">
              <Title className="text-lg font-bold text-black">Barbeiros</Title>
            </div>

            <div className="space-y-3 px-0.5">
              {loading.barbers ? (
                <div className="flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasBarbers ? (
                data.barbers.slice(0, 6).map((barber) => (
                  <div
                    key={barber.id}
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
                      <div className="flex items-center w-full h-full px-3 min-h-28 my-auto">
                        <CircleIcon className="min-w-24 h-24 my-auto overflow-hidden">
                          <img
                            src={barber.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=6C8762&color=fff&size=48`}
                            alt={barber.name}
                            className="w-24 h-24 object-cover"
                          />
                        </CircleIcon>

                        <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                          <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold leading-[150%] border-b border-gray-100 truncate">
                            {barber.name}
                          </p>
                          <p className="text-[#6b7280] font-roboto textarea-md font-normal leading-none">
                            {barber.role === 'BARBER' ? 'Barbeiro' : barber.role}

                          </p>
                          <p className="flex items-center gap-[1.5px] text-[#6b7280] inter textarea-md font-normal">
                            <img
                              alt="Icon location"
                              src={getIcons("location_outlined_green")}
                              className="size-4"
                            />
                            {barber.barberShop?.name || ''}
                          </p>
                          <div className="flex items-center gap-[3px]">
                            <img
                              alt="Icon star"
                              src={getIcons("star_solid_green")}
                              className="size-4 relative top-[-1px]"
                            />
                            <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                              {barber.averageRating > 0 ? barber.averageRating.toFixed(1) : '0.0'}
                            </p>
                            <div className="h-[7px] w-[0.5px] bg-[#6C8762]" />
                            <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                              {barber.totalAppointments || 1372} Cortes
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Text className="text-gray-500">Nenhum barbeiro disponível</Text>
                </div>
              )}
            </div>
          </div>
          <motion.button
            className="fixed bottom-20 right-2 flex items-center justify-center border border-white px-6 py-3 font-medium text-white rounded-lg shadow-lg bg-gradient-to-r bg-[#6C8762] focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer z-2"
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