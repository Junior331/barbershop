import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { Loading, Button, Text, Title } from "@/components/elements";
import { useOrder } from "@/store/useOrderStore";
import { useBarbers, AdaptedBarber } from "@/hooks/useBarbers";
import { BarberCard } from "./BarberCard";
import { getIcons } from "@/assets/icons";

export const Barbers = () => {
  const navigate = useNavigate();
  const { services, barber, setBarber } = useOrder();
  const serviceIds = services.map((s) => s.id);
  const { barbers, loading, error, refetch, hasBarbers } = useBarbers(serviceIds);

  const handleSelectBarber = useCallback(
    (selectedBarber: AdaptedBarber) => {
      setBarber({
        ...selectedBarber,
        email: selectedBarber.email || null,
        phone: selectedBarber.phone || null,
        avatar_url: selectedBarber.avatar_url || null,
        barber_details: {
          ...selectedBarber.barber_details,
          description: selectedBarber.barber_details.description || null,
        },
        services_full: selectedBarber.services_full.map(service => ({
          ...service,
          description: (service as any).description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          barberShopId: '',
          isActive: true,
          imageUrl: service.image_url
        })),
      } as any);
    },
    [setBarber]
  );

  const handleConfirm = useCallback(() => {
    if (barber) navigate("/calendar");
  }, [barber, navigate]);

  if (loading) return <Loading />;

  // Renderizar erro se houver
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col h-full w-full">
          <Header title="Barbeiros" backPath="/services" />
          <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <div className="flex flex-col items-center text-center max-w-md">
              <img
                src={getIcons("fallback")}
                alt="Erro"
                className="size-16 opacity-50 mb-4"
              />
              <Title className="text-gray-600 mb-2">Erro ao carregar barbeiros</Title>
              <Text className="text-gray-500 mb-6">{error}</Text>
              <Button onClick={refetch}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full w-full">
        <Header title="Barbeiros" backPath="/services" />

        <main className="flex flex-col w-full justify-between items-start gap-2 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">
          {hasBarbers ? (
            <>
              <div className="flex flex-col w-full gap-4">
                <div className="text-sm text-gray-600 mb-2">
                  {barbers.length} barbeiro{barbers.length !== 1 ? 's' : ''} disponível{barbers.length !== 1 ? 'eis' : ''} para os serviços selecionados
                </div>
                {barbers.map((barberItem) => (
                  <BarberCard
                    key={barberItem.id}
                    barber={barberItem}
                    isSelected={barber?.id === barberItem.id}
                    onSelect={handleSelectBarber}
                  />
                ))}
              </div>

              <Button
                type="button"
                disabled={!barber}
                onClick={handleConfirm}
                className="w-full max-w-full border-none bg-[#6C8762] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
              >
                {barber ? `Confirmar com ${barber.name}` : 'Selecione um barbeiro'}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-center p-4">
              <img
                src={getIcons("barber")}
                alt="Nenhum barbeiro"
                className="size-16 opacity-50 mb-4"
              />
              <Title className="text-gray-600 mb-2">
                {serviceIds.length > 0
                  ? "Nenhum barbeiro encontrado"
                  : "Selecione serviços primeiro"}
              </Title>
              <Text className="text-gray-500 mb-6">
                {serviceIds.length > 0
                  ? "Não encontramos barbeiros que fazem todos os serviços selecionados. Tente selecionar menos serviços ou barbeiros diferentes."
                  : "Você precisa selecionar pelo menos um serviço para ver os barbeiros disponíveis."}
              </Text>
              {serviceIds.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <Button onClick={refetch} variant="outline">
                    Tentar novamente
                  </Button>
                  <Button onClick={() => navigate("/services")} variant="outline">
                    Alterar serviços
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate("/services")}>
                  Selecionar serviços
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};
