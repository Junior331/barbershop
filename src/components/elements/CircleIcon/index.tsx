import { cn } from "@/utils/utils";
import { IProps } from "./@types";

export const CircleIcon = ({ children, className }: IProps) => {
  return (
    <div
      className={cn(
        "flex justify-center items-center min-w-[70px] min-h-[70px] size-[69px] rounded-[70px] border-3 object-cover border-white shadow-[0_0_14px_rgba(0,0,0,0.14)] bg-[#6C8762]",
        className
      )}
    >
      {children}
    </div>
  );
};
