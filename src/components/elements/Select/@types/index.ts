export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
};
