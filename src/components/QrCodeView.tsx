import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function QrCodeView({ valor, rotulo }: { valor: string; rotulo: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, valor, {
      width: 288,
      margin: 2,
      errorCorrectionLevel: "L",
      color: { dark: "#111827", light: "#ffffff" },
    }).catch(() => setErro("A lista é grande demais para caber em um QR Code. Copie o JSON."));
  }, [valor]);

  return (
    <div>
      <div className="flex justify-center rounded-md border-2 border-border bg-white p-3">
        <canvas ref={canvasRef} role="img" aria-label={rotulo} className="h-auto max-w-full" />
      </div>
      {erro ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
