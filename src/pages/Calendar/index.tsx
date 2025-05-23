import { timeSlots } from "./utiils";
import { getIcons } from "@/assets/icons";
import { useCalendar } from "./useCalendar";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { useEffect } from "react";
import { cn } from "@/utils/utils";

export const Calendar = () => {
  const {
    days,
    order,
    navigate,
    dayOfWeek,
    formatTime,
    monthNames,
    daysOfWeek,
    isSelected,
    currentDate,
    selectedTime,
    formattedDate,
    setCurrentDate,
    handleDayClick,
    isCurrentMonth,
    isTimeAvailable,
    handlePrevMonth,
    handleNextMonth,
    isDateSelectable,
    handleTimeSelection,
  } = useCalendar();

  useEffect(() => {
    if (order.date) {
      const storedDate = new Date(order.date);
      setCurrentDate(
        new Date(storedDate.getFullYear(), storedDate.getMonth(), 1)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.date]);

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Calendar"} backPath={"/barbers"} />

        <div className="flex h-full flex-col w-full justify-start items-start gap-5">
          <div className="flex items-center w-full h-auto px-4">
            <img
              alt="Image avatar"
              src={getIcons("calendar_solid_white")}
              className="w-[71px] h-[71px] p-2.5 bg-[#6C8762]  rounded-[70px] border-2 border-white object-cover filter drop-shadow-[0_2px_4px_rgba(112,121,116,0.30)]"
            />
            <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-1">
              <p className=" text-black inter textarea-md font-medium leading-none">
                {dayOfWeek}
              </p>
              <h2 className=" text-black inter text-2xl font-bold tracking-[1px] leading-none">
                {formattedDate}
              </h2>
            </div>
          </div>

          <div className="flex flex-col w-full bg-white shadow-sm p-4 pt-9 rounded-[40px_40px_0px_0px] overflow-auto h-[calc(100vh-220px)]">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="btn btn-circle btn-sm btn-ghost border-none hover:!bg-gray-100 active:!bg-gray-200 focus:!bg-gray-100 !shadow-none transition-all p-2.5"
                >
                  <img
                    alt="Previous month"
                    src={getIcons("arrow_line_left")}
                    className="w-5 h-5 object-contain pointer-events-none"
                  />
                </button>

                <h3 className="text-lg font-semibold text-[#000]">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h3>

                <button
                  onClick={handleNextMonth}
                  className="btn btn-circle btn-sm btn-ghost border-none hover:!bg-gray-100 active:!bg-gray-200 focus:!bg-gray-100 !shadow-none transition-all p-2.5"
                >
                  <img
                    alt="Next month"
                    src={getIcons("arrow_line_right")}
                    className="w-5 h-5 object-contain pointer-events-none"
                  />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-[#000]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const today = new Date();
                  const isToday =
                    isCurrentMonth &&
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth();

                  const isValidDay = day && isDateSelectable(day);

                  return (
                    <div
                      key={index}
                      onClick={() => isValidDay && handleDayClick(day)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center text-sm transition-all text-[#000] rounded-[10px] mx-auto",
                        day ? "cursor-pointer" : "opacity-0",
                        isToday && "!bg-blue-500 text-white",
                        isSelected(day as number) && "!bg-[#6C8762] text-white",
                        isValidDay
                          ? "hover:bg-gray-100"
                          : "cursor-not-allowed opacity-50"
                      )}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <h2 className="text-black inter text-[24px] font-medium leading-normal tracking-[1.2px] m-[25px_0px]">
              Horários
            </h2>

            <div className="w-full grid grid-cols-3 gap-3">
              {timeSlots.map((item) => {
                const isSelected = selectedTime === item.time;
                const isAvailable = isTimeAvailable(item.time);

                return (
                  <div
                    key={item.id}
                    className="w-full cursor-pointer"
                    onClick={() =>
                      isAvailable && handleTimeSelection(item.time)
                    }
                  >
                    <div
                      className={cn(
                        "w-full h-[33.568px] rounded-[21px] flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-[#ECEFF1]"
                          : !isAvailable
                          ? "bg-gray-100 cursor-not-allowed opacity-50"
                          : "bg-[#FFFFFF] filter drop-shadow-[0px_2px_4px_0px_rgba(156,163,175,0.20)] border border-[#6B7280]"
                      )}
                    >
                      <p
                        className={cn(
                          "textarea-md inter font-medium leading-none",
                          isSelected
                            ? "text-[rgba(107,114,128,0.2)]"
                            : !isAvailable
                            ? "text-gray-400"
                            : "text-[#6B7280]"
                        )}
                      >
                        {formatTime(item.time)}{" "}
                        {!isAvailable && (
                          <span className="text-xs text-gray-400">
                            (Indisponível)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!order.date}
              onClick={() => navigate("/confirm")}
              className="btn w-full max-w-full border-none bg-[#6C8762] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px] mt-10"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
