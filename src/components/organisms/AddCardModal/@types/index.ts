/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentMethod } from "@/pages/Wallet/@types";

export type AddPaymentMethodFn = (
  method: Omit<PaymentMethod, "id" | "created_at" | "is_default"> & {
    cvv?: string;
    method_type: string;
    card_number?: string;
    expiry_date?: string;
    cardholder_name: string;
  }
) => Promise<any>;

export type AddCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  addPaymentMethod: AddPaymentMethodFn;
};

export type CardFormData = {
  cvv: string;
  name: string;
  number: string;
  expiry: string;
  method_type: "credit_card" | "debit_card";
};
