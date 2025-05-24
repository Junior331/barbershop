import { useState } from "react";
import { useWallet } from "./useWallet";
import { Title } from "@/components/elements";

type AddCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddCardModal = ({ isOpen, onClose }: AddCardModalProps) => {
  const [cardData, setCardData] = useState({
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

  if (!isOpen) return null;

  return (
    <dialog open={isOpen} className="modal z-50">
      <div className="modal-box bg-white w-full max-w-11/12 md:max-w-10/12">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>

        <Title className="font-bold text-lg mb-4">Adicionar cartão</Title>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <div className="form-control">
            <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
              Número do cartão
            </label>
            <input
              type="text"
              value={formatCardNumber(cardData.number)}
              onChange={(e) =>
                setCardData({ ...cardData, number: e.target.value })
              }
              placeholder="1234 5678 9012 3456"
              className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Validade
              </label>
              <input
                type="text"
                value={cardData.expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 2) {
                    value = value.substring(0, 2) + "/" + value.substring(2, 4);
                  }
                  setCardData({ ...cardData, expiry: value });
                }}
                placeholder="MM/AA"
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]"
                maxLength={5}
                required
              />
            </div>

            <div className="form-control">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                CVV
              </label>
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) =>
                  setCardData({
                    ...cardData,
                    cvv: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="123"
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
              Nome no cartão
            </label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) =>
                setCardData({ ...cardData, name: e.target.value })
              }
              placeholder="Nome como está no cartão"
              className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]"
              required
            />
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn shadow-none bg-transparent border-red-500 !text-red-500">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary shadow-none border-0"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Adicionar cartão"
              )}
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
