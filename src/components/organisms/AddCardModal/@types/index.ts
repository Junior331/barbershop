export type AddCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type CardFormData = {
  cvv: string;
  name: string;
  number: string;
  expiry: string;
};
