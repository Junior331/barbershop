import { IProps } from "./@types";

export const Card = ({ children, ...res }: IProps) => {
  return (
    <div
      {...res}
      className={`flex flex-col items-center rounded-[10px] min-w-[75px] min-h-[94px] pt-[5px] pb-[10px] px-[5px] bg-[#6b7280] border-2 border-white shadow-[3px_3px_2px_0px_rgba(0,0,0,0.05),1px_1px_2px_0px_rgba(0,0,0,0.09),0px_0px_1px_0px_rgba(0,0,0,0.1)]`}
    >
      {children}
    </div>
  );
};
