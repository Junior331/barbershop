import { useState } from "react";
import { useWallet } from "@/pages/Wallet/useWallet";
import { CardFormData } from "@/components/organisms/AddCardModal/@types";

export const useAddCardModal = (onClose: () => void) => {
  const [cardData, setCardData] = useState<CardFormData>({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [loading, setLoading] = useState(false);
  const { addPaymentMethod } = useWallet("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPaymentMethod({
        method_type: "credit_card",
        card_number: cardData.number.replace(/\s/g, ""),
        expiry_date: cardData.expiry,
        cvv: cardData.cvv,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 2) {
      v = v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return {
    cardData,
    loading,
    setCardData,
    handleSubmit,
    formatCardNumber,
    formatExpiryDate,
  };
};
