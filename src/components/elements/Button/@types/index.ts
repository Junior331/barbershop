export type ButtonVariant = 'default' | 'destructive' | 'positive' | 'cancel' | 'subtle' | 'ghost' | 'link' | 'outline';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  loading?: boolean;
  variant?: ButtonVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
