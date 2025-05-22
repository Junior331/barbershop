import { Props } from "./@types";

export const Title = ({ children, className, ...rest }: Props) => {
  return (
    <h2 className={`inter text-[#111827] textarea-lg font-bold ${className}`} {...rest}>
      {children}
    </h2>
  );
};
