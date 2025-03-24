import { useNavigate } from "react-router-dom";
import { barbers } from "../Home/utils";
import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import { useOrder, useOrderActions } from "@/store/useOrderStore";
import { useEffect } from "react";

export const Barbers = () => {
  const order = useOrder();
  const { barber } = useOrder();
  const navigate = useNavigate();
  const { setBarber } = useOrderActions();

  const isBarberSelected = (id: number): boolean => barber.id === id;

  useEffect(() => {
    console.log("order ::", order);
  }, [order]);

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Barbeiros"} backPath={"/home"} />

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
                    <div className="flex items-center w-full h-full pr-[5px] min-h-28 relative">
                      <img
                        src={item.image}
                        alt={`Barber ${item.name}`}
                        className="min-w-32 min-h-32 max-w-32 max-h-32 object-cover border-r-[2px] border-[#E5E7EB]"
                      />

                      <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                        <p className="w-full text-start text-white inter textarea-lg font-bold leading-[150%] border-b border-[#E5E7EB] text_ellipsis">
                          {item.name}
                        </p>
                        <p className="text-white font-roboto textarea-md font-normal leading-none">
                          {item.type}
                        </p>
                        <p className="flex items-center gap-[1.5px] text-white inter textarea-md font-normal">
                          <img
                            alt="Icon location"
                            src={getIcons("location_outlined")}
                            className="size-4"
                          />
                          {item.location}
                        </p>
                        <div className="flex items-center gap-[3px]">
                          <img
                            alt="Icon star"
                            src={getIcons("star_solid")}
                            className="size-4 relative top-[-1px]"
                          />
                          <p className="flex items-center gap-[2.5px] text-white inter textarea-md font-normal">
                            {item.rating}
                          </p>
                          <div className="h-[7px] w-[0.5px] bg-white" />
                          <p className="flex items-center gap-[2.5px] text-white inter textarea-md font-normal">
                            {item.cuts} Cuts
                          </p>
                        </div>
                      </div>

                      <input
                        readOnly
                        type="checkbox"
                        name="rememberMe"
                        checked={checked}
                        className="self-stretch checkbox custom_before_service w-4 h-4 border border-[#fff] p-[3px] rounded-3xl !shadow-none absolute top-[12px] right-[8px]"
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
            className="btn w-full max-w-full border-none bg-[#6B7280] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
          >
            Confirm
          </button>
        </div>
      </div>
    </Layout>
  );
};
