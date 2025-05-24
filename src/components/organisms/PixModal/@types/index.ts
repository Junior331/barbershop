export interface PixModalProps {
  value: string;
  title?: string;
  amount?: number;
  isOpen: boolean;
  onClose: () => void;
}