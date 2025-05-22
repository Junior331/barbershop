import { Props } from "./@types";

export const Text = ({ children, className, ...rest }: Props) => {
  return (
    <p
      className={`inter text-[#6B7280] text-sm font-normal ${className} `}
      {...rest}
    >
      {children}
    </p>
  );
};