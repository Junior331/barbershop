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
        <Header title={"Serviços"} backPath={"/home"} />

        <div className="flex flex-col w-full justify-between items-start gap-2 px-4 pb-2 overflow-auto h-[calc(100vh-0px)]">
          <div className="grid grid-cols-1 gap-1 w-full max-w-full pb-[10px] pr-1">
            {staticServices.map((item) => {
              const checked = isServiceSelected(item.id);

              return (
                <div
                  tabIndex={0}
                  key={item.id}
                  role="button"
                  onClick={() => toggleService(item)}
                  onKeyDown={(e) => e.key === "Enter" && toggleService(item)}
                  className="btn size-auto bg-transparent border-0 shadow-none min-h-24 p-0"
                >
                  <Card
                    style={{
                      minWidth: "100%",
                      minHeight: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <div className="flex items-center w-full h-auto flex-1">
                      <img
                        src={item.icon}
                        alt={`Service ${item.name}`}
                        className="min-w-16 min-h-min-w-16 max-w-32 max-h-32 object-cover"
                      />

                      <div className="flex flex-col justify-start items-start w-full h-auto gap-2 flex-grow pl-2">
                        <p className="w-full text-start text-[#6b7280] inter textarea-lg font-bold text_ellipsis">
                          {item.name}
                        </p>

                        <p className="flex items-center gap-[5px] text-[#6b7280] font-[300] inter textarea-md leading-0">
                          <img
                            alt="Icon clock"
                            className="size-5"
                            src={getIcons("clock_outlined_green")}
                          />
                          <div className="h-2.5 rounded-2xl w-[0.8px] bg-[#6b7280] " />
                          {item.time}min
                        </p>

                        <p className="text-[#6b7280] inter textarea-md font-[300] leading-none">
                          {formatter({
                            type: "pt-BR",
                            currency: "BRL",
                            style: "currency",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.price || 0)}
                        </p>
                      </div>

                      <input
                        readOnly
                        type="checkbox"
                        name="rememberMe"
                        checked={checked}
                        className="relative top-[7px] left-[-5px] self-stretch checkbox custom_before_service w-4 h-4 border border-[#6b7280] p-[3px] rounded-3xl !shadow-none"
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!selectedServices.length}
            onClick={() => navigate("/barbers")}
            className="btn w-full max-w-full border-none bg-[#6B7280] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
          >
            Confirm
          </button>
        </div>
      </div>
    </Layout>
  );
};
