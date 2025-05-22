import { cn } from "@/utils/utils";
import { IStatusBadgeProps } from "./@types";
import { baseClasses, statusClasses } from "./variants";

export const StatusBadge = ({
  label,
  variant,
  className,
  status = "pending",
  ...props
}: IStatusBadgeProps) => {
  const colorClasses = statusClasses[variant as keyof typeof statusClasses][status];

  return (
    <span className={cn(baseClasses, colorClasses, className)} {...props}>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
