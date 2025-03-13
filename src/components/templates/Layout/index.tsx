import { IProps } from "./@types";
import { Sidebar } from "@/components/organisms";

export const Layout = ({ children }: IProps) => (
  <div className="flex flex-col w-full justify-center items-center h-screen relative">
    <main className="flex flex-1 justify-center items-center w-full h-full">{children}</main>
    <Sidebar />
  </div>
);
