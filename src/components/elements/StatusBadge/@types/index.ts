export type StatusType = 'completed' | 'warning' | 'canceled' | 'confirmed' | 'inactive' | 'failed' | 'pending';

export type VariantType = 'outline' | 'solid';

// export type StatusType = 'pending => pending' | 'confirmed => info' | 'canceled => error' | 'completed => success';

export interface IStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
  status?: StatusType;
  variant?: VariantType;
}
