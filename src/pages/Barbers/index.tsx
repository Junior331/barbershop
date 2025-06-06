import { useCallback } from "react";
import { IBarber } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { Loading } from "@/components/elements";
import { useOrder } from "@/store/useOrderStore";
import { useBarbers } from "@/hooks/useBarbers";
import { BarberCard } from "./BarberCard";

export const Barbers = () => {
  const navigate = useNavigate();
  const { services, barber, setBarber } = useOrder();
  const serviceIds = services.map((s) => s.id);
  const { barbers, loading, refetch } = useBarbers(serviceIds);

  const handleSelectBarber = useCallback(
    (selectedBarber: IBarber) => {
      setBarber({
        ...selectedBarber,
        barber_details: {
          ...selectedBarber.barber_details,
          // cuts_completed: selectedBarber.barber_details.cuts_completed || 0,
        },
      });
    },
    [setBarber]
  );

  const handleConfirm = useCallback(() => {
    if (barber) navigate("/calendar");
  }, [barber, navigate]);

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col h-full w-full">
        <Header title="Barbeiros" backPath="/services" />

        <main className="flex flex-col w-full justify-between items-start gap-2 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">
          {barbers.length > 0 ? (
            <>
              <div className="flex flex-col w-full gap-4">
                {barbers.map((barberItem) => (
                  <BarberCard
                    key={barberItem.id}
                    barber={barberItem}
                    isSelected={barber?.id === barberItem.id}
                    onSelect={handleSelectBarber}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={!barber}
                onClick={handleConfirm}
                className="btn w-full max-w-full border-none bg-[#6C8762] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
              >
                Confirm
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <p className="text-gray-600">
                {serviceIds.length > 0
                  ? "Nenhum barbeiro encontrado para os serviços selecionados."
                  : "Selecione pelo menos um serviço para ver os barbeiros disponíveis."}
              </p>
              {serviceIds.length > 0 && (
                <button
                  onClick={refetch}
                  className="mt-4 text-primary underline"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};
