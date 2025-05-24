import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/pages/Wallet/useWallet";
import { CardFormData } from "@/components/organisms/AddCardModal/@types";

export const useAddCardModal = (onClose: () => void) => {
  const [cardData, setCardData] = useState<CardFormData>({
    cvv: "",
    name: "",
    number: "",
    expiry: "",
    method_type: "credit_card",
  });
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const { addPaymentMethod } = useWallet(user?.id || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!cardData.number.replace(/\s/g, "").match(/^\d{13,16}$/)) {
      setLoading(false);
      return;
    }

    if (!cardData.expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      setLoading(false);
      return;
    }

    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      setLoading(false);
      return;
    }
    const [month, year] = cardData.expiry.split("/");
    const expiryDate = `20${year}-${month}-01`;

    try {
      await addPaymentMethod({
        method_type: cardData.method_type,
        card_number: cardData.number.replace(/\s/g, ""),
        expiry_date: expiryDate,
        cvv: cardData.cvv,
        cardholder_name: cardData.name,
      });

      onClose();
    } catch (err) {
      console.error("Erro ao adicionar cartão:", err);
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
