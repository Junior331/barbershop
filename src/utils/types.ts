export type styleGenericProps = {
  type?: string;
  size?: string;
  color?: string;
  filter?: string;
  height?: string;
  status?: string;
  margin?: string;
  active?: boolean;
  content?: string;
  maxWidth?: string;
  fontSize?: number;
  disabled?: boolean;
  textAlign?: string;
  selected?: boolean;
  secondary?: boolean;
  textShadow?: string;
  lineHeight?: string;
  fontWeight?: string;
  fontFamily?: string;
  background?: string;
  textTransform?: string;
  letterSpacing?: string;
};

export type formatterProps = {
  type?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: keyof Intl.NumberFormatOptionsStyleRegistry;
};

export type lang = {
  id: number;
  flag: string;
  code: string;
  label: string;
};

export type randomMessage = {
  id: number;
  title: string;
  message: string;
};
export type service = {
  id: number;
  date: string;
  name: string;
  time: number;
  icon: string;
  price: number;
  barber: string;
  location: string;
  status: "completed" | "pending";
};
