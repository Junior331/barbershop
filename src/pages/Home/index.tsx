import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { useAuth } from "@/context/AuthContext";
import { capitalizeName, cn, formatter } from "@/utils/utils";
import { useHome } from "./useHome";
import { Text, Title, Loading, CircleIcon } from "@/components/elements";
import { getServices } from "@/assets/services";

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

        <div className="flex flex-1 flex-col w-full h-full items-start justify-start overflow-y-auto pb-20 z-10">
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
                      <Text className="text-xs font-bold text-center mb-1">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(displayPrice || 0)}
                      </Text>
                      <Text className="text-xs text-gray-600 text-center truncate w-full">
                        {service.name}
                      </Text>
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

            <div className="space-y-3">
              {loading.appointments ? (
                <div className="flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasAppointments ? (
                data.appointments.slice(0, 2).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-center space-x-3 cursor-pointer"
                    onClick={() => navigate(`/appointment/${appointment.id}`)}
                  >
                    <div className="w-12 h-12 bg-[#7B9A7C] rounded-full flex items-center justify-center">
                      <img
                        src={appointment.service.imageUrl || getServices("haircuts")}
                        alt={appointment.service.name}
                        className="w-8 h-8 object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = getServices("haircuts");
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Title className="text-sm font-bold text-black mb-1">
                        {appointment.service.name}
                      </Title>
                      <Text className="text-xs text-gray-600 mb-1">
                        {appointment.barber.name}
                      </Text>
                      <div className="flex items-center space-x-1">
                        <img
                          src={getIcons("location_outlined_green")}
                          alt="Location"
                          className="w-3 h-3"
                        />
                        <Text className="text-xs text-gray-500">
                          {appointment.barberShop.name}
                        </Text>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <img
                          src={getIcons("clock_outlined_green")}
                          alt="Clock"
                          className="w-3 h-3"
                        />
                        <Text className="text-xs text-gray-500">
                          {appointment.service.durationMinutes}min
                        </Text>
                      </div>
                    </div>
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
              <button
                onClick={() => navigate("/barbers")}
                className="text-sm text-gray-600"
              >
                Ver mais
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {loading.barbers ? (
                <div className="col-span-2 flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasBarbers ? (
                data.barbers.slice(0, 6).map((barber) => (
                  <div
                    key={barber.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-center space-x-3 cursor-pointer"
                    onClick={() => navigate(`/barber/${barber.id}`)}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={barber.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=6C8762&color=fff&size=48`}
                        alt={barber.name}
                        className="w-12 h-12 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=6C8762&color=fff&size=48`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Title className="text-sm font-bold text-black truncate">
                        {barber.name}
                      </Title>
                      <Text className="text-xs text-gray-600">
                        {barber.role === 'BARBER' ? 'Barbeiro' : barber.role}
                      </Text>
                      <div className="flex items-center space-x-1 mt-1">
                        <img
                          src={getIcons("location_outlined_green")}
                          alt="Location"
                          className="w-3 h-3"
                        />
                        <Text className="text-xs text-gray-500 truncate">
                          {barber.barberShop?.name || 'Barbearia'}
                        </Text>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <img
                          src={getIcons("star_solid_green")}
                          alt="Star"
                          className="w-3 h-3"
                        />
                        <Text className="text-xs text-gray-500">
                          {barber.averageRating > 0 ? barber.averageRating.toFixed(1) : '4.0'}
                        </Text>
                        <Text className="text-xs text-gray-400">|</Text>
                        <Text className="text-xs text-gray-500">
                          {barber.totalAppointments || 1372} Cortes
                        </Text>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex items-center justify-center py-8">
                  <Text className="text-gray-500">Nenhum barbeiro disponível</Text>
                </div>
              )}
            </div>
          </div>

        </div>
        {/* Botão Agendar fixo */}
        <div className="absolute bottom-0 right-0 p-4 w-full max-w-40">
          <motion.button
            className="w-full py-3 bg-[#7B9A7C] text-white rounded-lg font-medium text-lg"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/services")}
          >
            Agendar
          </motion.button>
        </div>
      </div>
    </Layout>
  );
};