import { useMemo } from "react";
import { isBefore } from "date-fns";

import { mocks } from "@/services/mocks";
import { getIcons } from "@/assets/icons";
import { formatDateTime, formatter, getCurrentDate } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import SwipeableCard from "./SwipeableCard";

export const Calendar = () => {
  const { dayOfWeek, formattedDate } = getCurrentDate();

  const processedServices = useMemo(
    () =>
      mocks.orders.map((service) => {
        const serviceDate = new Date(service.date);
        const currentDate = new Date();

        // Zerar as horas para comparar apenas a data
        serviceDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        const isCompleted =
          service.status === "completed" || isBefore(serviceDate, currentDate);

        console.log("Service Date:", serviceDate.toISOString());
        console.log("Current Date:", currentDate.toISOString());
        console.log("Is Completed:", isCompleted);

        return { ...service, isCompleted };
      }),
    []
  );

  const dotsArray = Array.from({ length: 20 });

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"My bookings"} backPath={"/home"} />
        <div className="flex flex-col justify-start items-center h-full w-full p-4 pr-2 pt-2">
          <div className="flex w-full gap-3 mb-4">
            <div className="w-[71px] h-[71px] flex justify-center items-center rounded-[71px] flex-shrink-0 bg-[#6B7280] border-2 border-white filter drop-shadow-[0px_2px_4px_rgba(112,121,116,0.30)]">
              <img src={getIcons("calendar_solid_white")} alt="Icon calendar" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-black font-inter text-[12px] font-medium leading-normal">
                {dayOfWeek}
              </p>
              <h2 className="text-black font-inter text-[20px] font-bold leading-normal">
                {formattedDate}
              </h2>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 w-full h-full items-start justify-start overflow-y-auto pr-2">
            {/* {processedServices
              .filter((item) => !item.isCompleted)
              .map((item) => (
                <div
                  key={item.id}
                  className="btn w-full h-auto bg-transparent border-0 shadow-none p-0"
                >
                  <Card
                    style={{
                      padding: 11.5,
                      paddingLeft: 2,
                      minWidth: "100%",
                      minHeight: "initial",
                    }}
                  >
                    <div className="flex items-center w-full h-full">
                      <img
                        src={item.icon}
                        alt={`Service ${item.name}`}
                        className="w-[87px] h-[87px]"
                      />
                      <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                        <p className="text-white font-inter text-[13px] font-bold leading-[150%]">
                          {item.name}
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Price: </strong>
                          {formatter({
                            type: "pt-BR",
                            currency: "BRL",
                            style: "currency",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.price || 0)}{" "}
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Time: </strong>
                          {item.time} minutes
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Date: </strong>
                          {formatDateTime(item.date, "date")} at{" "}
                          {formatDateTime(item.date, "time")}
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Barber: </strong>
                          {item.barber}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))} */}

              <SwipeableCard />

            <div className="flex gap-0.5 justify-center items-center w-full min-h-10 overflow-hidden">
              {dotsArray.map((_, index) => (
                <div
                  key={`left-${index}`}
                  className="min-w-1 min-h-1 rounded bg-[#000]"
                ></div>
              ))}
              <div className="w-[136px] h-[29px] flex-shrink-0 rounded-[25px] bg-white shadow-[0px_4px_4px_0px_rgba(50,183,104,0.15)] flex justify-center items-center mx-1.5">
                <h2 className="text-black font-roboto text-[16px] font-medium leading-none">
                  Finished.
                </h2>
              </div>
              {dotsArray.map((_, index) => (
                <div
                  key={`right-${index}`}
                  className="min-w-1 min-h-1 rounded bg-[#000]"
                ></div>
              ))}
            </div>

            {processedServices
              .filter((item) => item.isCompleted)
              .map((item) => (
                <div
                  key={item.id}
                  className="btn w-full h-auto bg-transparent border-0 shadow-none p-0 filter blur-[0.75px]"
                >
                  <Card
                    style={{
                      padding: 11.5,
                      paddingLeft: 2,
                      minWidth: "100%",
                      minHeight: "initial",
                    }}
                  >
                    <div className="flex items-center w-full h-full">
                      <img
                        src={item.icon}
                        alt={`Service ${item.name}`}
                        className="w-[87px] h-[87px]"
                      />
                      <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                        <p className="text-white font-inter text-[13px] font-bold leading-[150%]">
                          {item.name}
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Price: </strong>
                          {formatter({
                            type: "pt-BR",
                            currency: "BRL",
                            style: "currency",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.price || 0)}{" "}
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Time: </strong>
                          {item.time} minutes
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Date: </strong>
                          {formatDateTime(item.date, "date")} at{" "}
                          {formatDateTime(item.date, "time")}
                        </p>
                        <p className="text-white inter text-[8px] font-[300] leading-none">
                          <strong className="font-bold text-[11px]">Barber: </strong>
                          {item.barber}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
