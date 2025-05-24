import { AddCardModalProps } from "./@types";
import { Select, Title } from "@/components/elements";
import { useAddCardModal } from "@/hooks/useAddCardModal";

export const AddCardModal = ({ 
  isOpen, 
  onClose,
  addPaymentMethod 
}: AddCardModalProps) => {
  const {
    cardData,
    loading,
    setCardData,
    handleSubmit,
    formatCardNumber,
    formatExpiryDate,
  } = useAddCardModal(onClose, addPaymentMethod);

  if (!isOpen) return null;

  const paymentMethodOptions = [
    { value: "credit_card", label: "Cartão de Crédito" },
    { value: "debit_card", label: "Cartão de Débito" },
  ];

  return (
    <dialog open={isOpen} className="modal z-50">
      <div className="modal-box bg-white w-full max-w-11/12 md:max-w-md">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle shadow-none btn-ghost absolute hover:bg-[#eaeaea80] !border-none !text-black right-2 top-2"
        >
          ✕
        </button>

        <Title className="font-bold text-lg mb-4">Adicionar cartão</Title>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <div className="form-control ">
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
              className="w-full h-[48px] px-[10px] rounded-[5px] border border-[#D8D6DE]"
              maxLength={19}
              required
            />
          </div>

          <div className="form-control">
            <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
              Tipo
            </label>
            <Select
              options={paymentMethodOptions}
              defaultValue={cardData.method_type || ""}
              onChange={(value) =>
                setCardData({
                  ...cardData,
                  method_type: value as "credit_card" | "debit_card",
                })
              }
              className="h-[48px]"
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
                  setCardData({
                    ...cardData,
                    expiry: formatExpiryDate(e.target.value),
                  });
                }}
                placeholder="MM/AA"
                className="w-full h-[48px] px-[10px] rounded-[5px] border border-[#D8D6DE]"
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
                className="w-full h-[48px] px-[10px] rounded-[5px] border border-[#D8D6DE]"
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
              className="w-full h-[48px] px-[10px] rounded-[5px] border border-[#D8D6DE]"
              required
            />
          </div>

          <div className="modal-action flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="btn shadow-none bg-transparent border-red-500 !text-red-500"
            >
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
                "Adicionar"
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
