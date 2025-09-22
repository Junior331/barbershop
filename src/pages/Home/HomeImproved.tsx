import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { Card } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { CircleIcon, Text, Title, Loading } from "@/components/elements";
import { useAuth } from "@/context/AuthContext";
import { capitalizeName } from "@/utils/utils";

// Services
import { barbersService, appointmentsService } from "@/services";
import type { Barber, Appointment } from "@/services";

export const HomeImproved = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [recentOrders, setRecentOrders] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);

        // Carregar dados em paralelo
        const [barbersData, ordersData] = await Promise.all([
          barbersService.getForHome(8),
          appointmentsService.getMyHistory(1, 3) // Últimos 3 pedidos
        ]);

        setBarbers(barbersData);
        setRecentOrders(ordersData.data);

      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'CONFIRMED':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      case 'EXPIRED':
        return 'Expirado';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="bg-[#f7f8fde8] w-screen h-screen fixed top-[180px]" />
      <div className="flex flex-col pt-[27px] px-3 pr-1 justify-start items-start h-screen w-full">
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

          {/* Seção de Seus Pedidos */}
          <div className="flex flex-col items-center w-full mt-5 pr-2">
            <div className="flex items-center justify-between w-full gap-1 mb-2">
              <Title className="textarea-lg">Seus pedidos recentes</Title>
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
              {recentOrders.length === 0 ? (
                <div className="w-full text-center py-8">
                  <Text className="text-gray-500">Nenhum agendamento encontrado</Text>
                  <motion.button
                    className="mt-4 px-4 py-2 bg-[#6C8762] text-white rounded-lg"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/services")}
                  >
                    Fazer primeiro agendamento
                  </motion.button>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="btn w-[300px] h-auto bg-transparent border-0 shadow-none p-0">
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
                            src={order.barber.avatarUrl || "/placeholder-avatar.jpg"}
                            alt={`Barber ${order.barber.name}`}
                            className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
                          />
                        </CircleIcon>

                        <div className="flex flex-col justify-start items-start w-full gap-[8px] flex-grow pl-2">
                          <div className="flex items-center justify-between w-full">
                            <Title className="text-start border-b border-[#E5E7EB]">
                              {order.service.name}
                            </Title>
                            <span className={`text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <Text className="leading-none">{order.barber.name}</Text>
                          <Text className="flex items-center gap-[1.5px]">
                            <img
                              className="size-4"
                              alt="Icon location"
                              src={getIcons("location_outlined_green")}
                            />
                            {order.barberShop.name}
                          </Text>
                          <Text className="flex items-center gap-2">
                            <img
                              alt="Icon clock"
                              className="size-4"
                              src={getIcons("clock_outlined_green")}
                            />
                            <div className="h-3 w-[1.5px] bg-[#6C8762]" />
                            {order.service.durationMinutes}min
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {new Date(order.scheduledTo).toLocaleDateString('pt-BR')} às {order.scheduledTime}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Seção de Barbeiros */}
          <div className="flex flex-col items-center w-full mt-5">
            <div className="flex items-center justify-between w-full gap-1 mb-2">
              <label className="text-[#000] inter textarea-lg font-bold leading-[150%]">
                Barbeiros recomendados
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full overflow-auto max-w-full pb-[10px] pr-1">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="btn w-full h-auto bg-transparent border-0 shadow-none p-0"
                  onClick={() => navigate(`/barbers/${barber.id}`)}
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
                          src={barber.avatarUrl || "/placeholder-avatar.jpg"}
                          alt={`Barber ${barber.name}`}
                          className="w-24 h-24 object-cover"
                        />
                      </CircleIcon>

                      <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                        <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold leading-[150%] border-b border-[#9CA3AF] truncate">
                          {barber.name}
                        </p>
                        <p className="text-[#6b7280] font-roboto textarea-md font-normal leading-none">
                          {barber.role}
                        </p>
                        <p className="flex items-center gap-[1.5px] text-[#6b7280] inter textarea-md font-normal">
                          <img
                            alt="Icon location"
                            src={getIcons("location_outlined_green")}
                            className="size-4"
                          />
                          {barber.barberShop?.name || 'Barbearia'}
                        </p>
                        <div className="flex items-center gap-[3px]">
                          <img
                            alt="Icon star"
                            src={getIcons("star_solid_green")}
                            className="size-4 relative top-[-1px]"
                          />
                          <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                            {barber.averageRating.toFixed(1)}
                          </p>
                          <div className="h-[7px] w-[0.5px] bg-[#6C8762]" />
                          <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                            {barber.totalAppointments} Cortes
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Botão flutuante de agendar */}
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