import { IProps } from "./@types";
import { getIcons } from "@/assets/icons";
import { Sidebar } from "@/components/organisms";

export const Layout = ({ children }: IProps) => {
  return (
    <div className="flex flex-col w-full justify-center items-center h-screen relative">
      <img
        alt="Icon pole right"
        src={getIcons("pole_right")}
        className="fixed top-[15px] right-[-25px]"
      />
      <img
        alt="Icon pole left"
        src={getIcons("pole_left")}
        className="fixed bottom-[100px] left-[-5px]"
      />
      <main className="flex flex-1 justify-center items-start w-full h-full overflow-hidden relative z-10">
        {children}
      </main>
      <Sidebar />
    </div>
  );
};
