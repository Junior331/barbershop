import QRCode from "qrcode";
import { useEffect, useRef } from "react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export const QRCodeGenerator = ({ value, size = 200 }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("Erro ao gerar QR Code:", error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="border-2 border-gray-200 rounded-lg" />
    </div>
  );
};
