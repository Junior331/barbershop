import { useNavigate } from "react-router-dom";

import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { services as staticServices } from "./utils";
import { Card, Header } from "@/components/organisms";
import { useOrder, useOrderActions } from "@/store/useOrderStore";

export const Services = () => {
  const navigate = useNavigate();
  const { toggleService } = useOrderActions();
  const { services: selectedServices } = useOrder();

  const isServiceSelected = (id: number): boolean =>
    selectedServices.some((service) => service.id === id);

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Services"} backPath={"/home"} />

        <div className="flex flex-col w-full h-full justify-between items-start gap-5 px-4 pb-2">
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-[10px] w-full overflow-auto max-w-full pb-[10px] 5 pr-1">
            {staticServices.map((item) => {
              const checked = isServiceSelected(item.id);

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleService(item)}
                  onKeyDown={(e) => e.key === "Enter" && toggleService(item)}
                  className="btn w-full h-auto bg-transparent border-0 shadow-none p-0  min-h-24 min-w-20"
                >
                  <Card
                    style={{
                      minWidth: "100%",
                      overflow: "hidden",
                      minHeight: "initial",
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <p className="flex items-center gap-[2.5px] text-white inter text-[6.5px] font-normal leading-0">
                        <img
                          alt="Icon clock"
                          src={getIcons("clock_outlined")}
                        />
                        <div className="h-[7px] w-[0.5px] bg-white " />
                        {item.time}min
                      </p>

                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={checked}
                        readOnly
                        className="checkbox custom_before_service w-4 h-4 border border-[#fff] p-[3px] rounded-3xl !shadow-none"
                      />
                    </div>
                    <img
                      src={item.icon}
                      alt={`Service ${item.name}`}
                      className="w-[45px] h-[45px] mx-auto"
                    />
                    <div className="flex-1 flex flex-col items-start justify-end w-full h-full gap-1 mt-1">
                      <p className="text-white inter text-[9px] font-bold leading-none">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.price || 0)}
                      </p>
                      <p className="text-white inter text-[9px] font-bold leading-none truncate max-w-[80px]">
                        {item.name}
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!selectedServices.length}
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
