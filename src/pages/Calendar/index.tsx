import { useEffect } from "react";
import { cn } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { useCalendar } from "./useCalendar";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";

export const Calendar = () => {
  const {
    days,
    date,
    navigate,
    monthNames,
    daysOfWeek,
    formatTime,
    isSelected,
    currentDate,
    selectedDate,
    selectedTime,
    formattedDate,
    setCurrentDate,
    handleDayClick,
    availableSlots,
    handlePrevMonth,
    handleNextMonth,
    isTimeAvailable,
    isDateSelectable,
    handleTimeSelection,
  } = useCalendar();

  // Sincronizar com a data armazenada no order
  useEffect(() => {
    if (date) {
      const storedDate = new Date(date);
      setCurrentDate(new Date(storedDate.getFullYear(), storedDate.getMonth(), 1));
    }
  }, [date, setCurrentDate]);

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Calendar"} backPath={"/barbers"} />

        <div className="flex h-full flex-col w-full justify-start items-start gap-5">
          <div className="flex items-center w-full h-auto px-4">
            <img
              alt="Image avatar"
              src={getIcons("calendar_solid_white")}
              className="w-[71px] h-[71px] p-2.5 bg-[#6C8762] rounded-[70px] border-2 border-white object-cover filter drop-shadow-[0_2px_4px_rgba(112,121,116,0.30)]"
            />
            <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-1">
              <p className="text-black inter textarea-md font-medium leading-none">
                {formattedDate}
              </p>
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
                  <div key={day} className="text-center text-sm font-medium text-[#000]">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isToday = isSelected(day as number);

                  return (
                    <div
                      key={index}
                      onClick={() => isDateSelectable(day) && handleDayClick(day)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center text-sm transition-all text-[#000] rounded-[10px] mx-auto",
                        isToday && "!bg-blue-500 text-white",
                        isSelected(day) && "!bg-[#6C8762] text-white",
                        isDateSelectable(day) ? "cursor-pointer hover:bg-gray-100" : "cursor-not-allowed opacity-50"
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
              {availableSlots.length ? (
                availableSlots.map((timeSlot) => {
                  const isAvailable = isTimeAvailable(timeSlot);

                  return (
                    <div
                      key={timeSlot}
                      className="w-full cursor-pointer"
                      onClick={() => isAvailable && handleTimeSelection(timeSlot)}
                    >
                      <div
                        className={cn(
                          "w-full h-[33.568px] rounded-[21px] flex items-center justify-center transition-colors",
                          selectedTime === timeSlot ? "bg-[#ECEFF1]" : !isAvailable ? "bg-gray-100 cursor-not-allowed opacity-50" : "bg-[#FFFFFF] filter drop-shadow-[0px_2px_4px_0px_rgba(156,163,175,0.20)] border border-[#6B7280]"
                        )}
                      >
                        <p
                          className={cn(
                            "textarea-md inter font-medium leading-none",
                            selectedTime === timeSlot
                              ? "text-[rgba(107,114,128,0.2)]"
                              : !isAvailable
                              ? "text-gray-400"
                              : "text-[#6B7280]"
                          )}
                        >
                          {formatTime(timeSlot)}{" "}
                          {!isAvailable && (
                            <span className="text-xs text-gray-400">(Indisponível)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400">Nenhum horário disponível.</p>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedTime || !selectedDate}
              onClick={() => navigate("/confirm")}
              className="btn w-full max-w-full border-none bg-[#6C8762] disabled:!bg-[#e5e5e5] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px] mt-10"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
