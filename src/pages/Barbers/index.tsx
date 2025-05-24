import { useNavigate } from "react-router-dom";

import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { useBarbers } from "@/hooks/useBarbers";
import { Card, Header } from "@/components/organisms";
import { CircleIcon, Loading } from "@/components/elements";
import { useOrder, useOrderActions } from "@/store/useOrderStore";

export const Barbers = () => {
  const { barber } = useOrder();
  const navigate = useNavigate();
  const { setBarber } = useOrderActions();

  const isBarberSelected = (id: string): boolean => barber.id === id;

  const { barbers, loading, error } = useBarbers();

  if (loading) return <Loading />;
  if (error) return <div>Erro: {error}</div>;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Barbeiros"} backPath={"/services"} />

        <div className="flex flex-col w-full justify-between items-start gap-2 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full overflow-auto max-w-full pb-[10px] pr-1">
            {barbers.map((item) => {
              const checked = isBarberSelected(item.id);

              return (
                <div
                  key={item.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => setBarber(item)}
                  onKeyDown={(e) => e.key === "Enter" && setBarber(item)}
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
                    <div className="flex items-center w-full h-full px-3 min-h-28 my-auto relative">
                      <CircleIcon className="min-w-24 h-24 my-auto overflow-hidden">
                        <img
                          src={item.image}
                          alt={`Barber ${item.name}`}
                          className="w-24 h-24 object-cover"
                        />
                      </CircleIcon>

                      <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                        <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold leading-[150%] border-b border-[#9CA3AF] truncate">
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
                        <div className="flex items-center gap-1.5">
                          <img
                            alt="Icon star"
                            src={getIcons("star_solid_green")}
                            className="size-4 relative top-[-1px]"
                          />
                          <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                            {item.rating}
                          </p>
                          <div className="h-[7px] rounded-2xl w-[0.5px] bg-[#6C8762]" />
                          <p className="flex items-center gap-[2.5px] text-[#6b7280] inter textarea-md font-normal">
                            {item.cuts} Cuts
                          </p>
                        </div>
                      </div>

                      <input
                        readOnly
                        type="checkbox"
                        name="rememberMe"
                        checked={checked}
                        className="self-stretch checkbox custom_before_service w-4 h-4 border border-[#6b7280] p-[3px] rounded-3xl !shadow-none absolute top-1.5 right-3"
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!barber}
            onClick={() => navigate("/calendar")}
            className="btn w-full max-w-full border-none bg-[#6C8762] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
          >
            Confirm
          </button>
        </div>
      </div>
    </Layout>
  );
};
