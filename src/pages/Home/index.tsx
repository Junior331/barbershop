import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { getIcons } from "@/assets/icons";
import { Card } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { useAuth } from "@/context/AuthContext";
import { capitalizeName, formatter } from "@/utils/utils";
import { useHome } from "./useHome";
import { CircleIcon, Text, Title, Loading } from "@/components/elements";
import { getServices } from "@/assets/services";
import { barbersService } from "@/services/barbers.service";
import { appointmentsService } from "@/services/appointments.service";

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, isLoading, hasPromotions, hasAppointments, hasBarbers, refreshData } = useHome();

  // Função para atualizar dados
  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <Layout>
      <div className="bg-[#f7f8fde8] w-screen h-screen fixed top-[180px]" />
      <div className="flex flex-col pt-[27px] px-3 pr-1 justify-start items-start h-screen w-full">
        <div className="w-full mb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-[300] flex flex-col text-[#283046] max-w-[145px] inter text-[26px] leading-[36px]">
              Olá,
              <Title className="!text-3xl !text-[#566F4C]">
                {capitalizeName(user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuário")}
              </Title>
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Atualizar dados"
            >
              <img
                src={getIcons("refresh")}
                alt="Atualizar"
                className={`size-6 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col w-full h-full items-start justify-start overflow-y-auto pb-20 z-10">
          <div className="flex flex-col items-center w-full pr-2">
            <div className="flex items-center justify-between w-full gap-1 mb-2">
              <label className="text-[#000] inter textarea-lg font-bold leading-[150%]">
                Promoções da semana
              </label>
            </div>

            <div className="flex items-center justify-start w-full overflow-auto max-w-full gap-[10px] pb-[10px]">
              {loading.promotions ? (
                <div className="flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasPromotions ? (
                data.promotions.map((service) => {
                  const displayPrice = service.promotionalPrice || service.price;
                  const hasDiscount = service.promotionalPrice && service.promotionalPrice < service.price;

                  return (
                    <Card
                      key={service.id}
                      style={{
                        minWidth: 110,
                        minHeight: 120,
                        paddingLeft: 8,
                      }}
                    >
                      <CircleIcon>
                        <img
                          src={service.imageUrl || getServices("haircuts")}
                          alt={`Service ${service.name}`}
                          className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                          onError={(e) => {
                            e.currentTarget.src = getServices("haircuts");
                          }}
                        />
                      </CircleIcon>
                      <div className="flex-1 flex flex-col justify-end w-full h-full gap-2 mt-2">
                        <div className="flex flex-col">
                          <Title className="textarea-md">
                            {formatter({
                              type: "pt-BR",
                              currency: "BRL",
                              style: "currency",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(displayPrice || 0)}
                          </Title>
                          {hasDiscount && (
                            <Text className="text-xs line-through text-gray-500">
                              {formatter({
                                type: "pt-BR",
                                currency: "BRL",
                                style: "currency",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(service.price)}
                            </Text>
                          )}
                        </div>
                        <Text className="truncate max-w-[calc(100%-5px)]">
                          {service.name}
                        </Text>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="flex items-center justify-center w-full py-8">
                  <Text className="text-gray-500">Nenhuma promoção disponível no momento</Text>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center w-full mt-5 pr-2">
            <div className="flex items-center justify-between w-full gap-1 mb-2">
              <Title className="textarea-lg">Seus serviços</Title>
              <button
                type="button"
                onClick={() => navigate("/mybookings")}
                className="btn p-0 m-0 btn-link border-none !no-underline"
              >
                <Text className="text-[#111827] font-medium textarea-md">
                  Ver mais
                </Text>
              </button>
            </div>

            <div className="flex items-center justify-start w-full overflow-auto max-w-full gap-[10px] pb-[10px]">
              {loading.appointments ? (
                <div className="flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasAppointments ? (
                data.appointments.map((appointment) => {
                  const statusDisplay = appointmentsService.getStatusDisplay(appointment.status);

                  return (
                    <button
                      key={appointment.id}
                      className="btn w-[300px] h-auto bg-transparent border-0 shadow-none p-0"
                      onClick={() => navigate(`/appointment/${appointment.id}`)}
                    >
                      <Card
                        style={{
                          minWidth: 300,
                          paddingLeft: 2,
                          minHeight: "initial",
                        }}
                      >
                        <div className="flex items-center w-full h-full">
                          <CircleIcon className="min-w-24 h-24">
                            <img
                              src={appointment.service.imageUrl || getServices("haircuts")}
                              alt={`Service ${appointment.service.name}`}
                              className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                              onError={(e) => {
                                e.currentTarget.src = getServices("haircuts");
                              }}
                            />
                          </CircleIcon>

                          <div className="flex flex-col justify-start items-start w-full gap-[8px] flex-grow pl-2">
                            <div className="flex items-center justify-between w-full">
                              <Title className="text-start border-b border-[#E5E7EB] flex-1">
                                {appointment.service.name}
                              </Title>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}
                              >
                                {statusDisplay.label}
                              </span>
                            </div>
                            <Text className="leading-none">{appointment.barber.name}</Text>
                            <Text className="flex items-center gap-[1.5px]">
                              <img
                                className="size-4"
                                alt="Icon location"
                                src={getIcons("location_outlined_green")}
                              />
                              {appointment.barberShop.name}
                            </Text>
                            <Text className="flex items-center gap-2">
                              <img
                                alt="Icon clock"
                                className="size-4"
                                src={getIcons("clock_outlined_green")}
                              />
                              <div className="h-3 w-[1.5px] bg-[#6C8762]" />
                              {appointment.service.durationMinutes}min
                            </Text>
                            <Text className="text-xs text-gray-600">
                              {new Date(appointment.scheduledTo).toLocaleDateString('pt-BR')} às {appointment.scheduledTime}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-8">
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

          <div className="flex flex-col items-center w-full mt-5">
            <div className="flex items-center justify-between w-full gap-1 mb-2">
              <label className="text-[#000] inter textarea-lg font-bold leading-[150%]">
                Barbeiros
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full overflow-auto max-w-full pb-[10px] 5 pr-1">
              {loading.barbers ? (
                <div className="col-span-full flex items-center justify-center w-full py-8">
                  <Loading />
                </div>
              ) : hasBarbers ? (
                data.barbers.map((barber) => {
                  const displayInfo = barbersService.getBarberDisplayInfo(barber);

                  return (
                    <button
                      key={barber.id}
                      className="btn w-full h-auto bg-transparent border-0 shadow-none p-0"
                      onClick={() => navigate(`/barber/${barber.id}`)}
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
                              src={barber.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=6C8762&color=fff&size=96`}
                              alt={`Barber ${barber.name}`}
                              className="w-24 h-24 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=6C8762&color=fff&size=96`;
                              }}
                            />
                          </CircleIcon>

                          <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                            <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold leading-[150%] border-b border-[#9CA3AF] truncate">
                              {displayInfo.name}
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
                              {barber.barberShop?.name || 'Barbearia Parceira'}
                            </p>
                            <div className="flex items-center gap-[3px]">
                              <img
                                alt="Icon star"
                                src={getIcons("star_solid_green")}
                                className="size-4 relative top-[-1px]"
                              />
                              <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                                {barber.averageRating > 0 ? barber.averageRating.toFixed(1) : 'N/A'}
                              </p>
                              <div className="h-[7px] w-[0.5px] bg-[#6C8762]" />
                              <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                                {barber.totalAppointments} Cortes
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {displayInfo.experience}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full flex items-center justify-center w-full py-8">
                  <Text className="text-gray-500">Nenhum barbeiro disponível no momento</Text>
                </div>
              )}
            </div>
          </div>

          <motion.button
            className="fixed bottom-24 right-2 flex items-center justify-center border border-white px-6 py-3 font-medium text-white rounded-lg shadow-lg bg-gradient-to-r bg-[#6C8762] focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
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
