import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";

import { PixModalProps } from "./@types";
import { formatter } from "@/utils/utils";
import { Text, Title } from "@/components/elements";
import { QRCodeGenerator } from "../QRCodeGenerator";

export const PixModal = ({
  value,
  amount,
  isOpen,
  onClose,
  title = "Pagamento",
}: PixModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("O código PIX foi copiado para a área de transferência.");

      setTimeout(() => setCopied(false), 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível copiar o código PIX.";
      toast.error(errorMessage);
    }
  };

  return (
    <dialog open={isOpen} className="modal z-50">
      <div className="modal-box bg-white w-full max-w-11/12 md:max-w-md">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle shadow-none btn-ghost absolute hover:bg-[#eaeaea80] !border-none !text-black right-2 top-2"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-2.5">
          <Title className="font-bold text-lg">{title} PIX</Title>
          {amount && (
            <Text className="text-xl font-semibold text-green-500">
              {formatter({
                type: "pt-BR",
                currency: "BRL",
                style: "currency",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(amount)}
            </Text>
          )}

          <Text className="text-sm !font-light text-center">
            Escaneie o QR Code com o app do seu banco ou copie o código abaixo
          </Text>

          <QRCodeGenerator value={value} size={200} />

          <div className="w-full">
            <Text className="text-sm font-semibold mb-2">CÓDIGO PIX</Text>
            <div className="bg-[#f9fafb] border-2 border-dashed border-[#d1d5db] p-3 rounded-lg break-all text-sm">
              {value}
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="w-full btn border-none shadow-none bg-green-600 hover:bg-green-700 text-white font-medium py-3 transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar código
              </>
            )}
          </button>

          <Text className="text-sm !font-light mt-2 text-center">
            Após realizar o {title.toLowerCase()}, a transação será processada
            automaticamente.
          </Text>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
