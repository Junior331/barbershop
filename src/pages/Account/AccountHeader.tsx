import { AccountHeaderProps } from "./@types";

export const AccountHeader = ({
  title,
  imageSrc,
  imageAlt,
  subtitle,
  children,
}: AccountHeaderProps) => (
  <div className="flex items-center gap-2 w-full">
    <div className="min-w-10 min-h-10 rounded-full bg-[#F4F4F4] p-1.5">
      <img src={imageSrc} alt={imageAlt} className="size-full" />
    </div>
    <div className="flex flex-col gap-1 flex-1">
      {title && (
        <h2 className="textarea-md font-medium text-[#181D27]">{title}</h2>
      )}
      {subtitle && <p className="text-[#ABABAB] textarea-sm">{subtitle}</p>}
    </div>
    <div className="w-fit">{children}</div>
  </div>
);
