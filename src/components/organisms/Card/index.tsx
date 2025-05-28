import { IProps } from "./@types";

export const Card = ({ children, ...res }: IProps) => {
  return (
    <div
      {...res}
      className={`flex flex-col items-center rounded-[10px] min-w-[75px] min-h-[94px] pt-[5px] pb-[10px] px-[5px] bg-[#FFFFFF] shadow-[0px_2px_4px_0px_rgba(156,163,175,0.20)] ${res.className}`}
    >
      {children}
    </div>
  );
};
