import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export function QrScanner({
  ativo,
  onLeitura,
  onErro,
}: {
  ativo: boolean;
  onLeitura: (texto: string) => void;
  onErro: (mensagem: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lendo, setLendo] = useState(false);
  const [zoomAtual, setZoomAtual] = useState<number>(1);
  const [suportaZoom, setSuportaZoom] = useState(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let parado = false;
    let stream: MediaStream | undefined;
    let quadro = 0;

    async function iniciar() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        onErro("Câmera indisponível neste navegador. Cole o JSON abaixo.");
        return;
      }

      try {
        // Busca câmeras disponíveis para selecionar a câmera traseira principal (1x)
        let videoConstraints: MediaTrackConstraints = {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        };

        if (navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          // Procura câmera traseira que não seja ultra-wide (0.5x ou wide angle)
          const standardBack = videoInputs.find(
            (d) =>
              /back|rear|traseira|ambiente/i.test(d.label) && !/wide|ultra|0\.5|0,5/i.test(d.label),
          );
          if (standardBack?.deviceId) {
            videoConstraints = {
              deviceId: { exact: standardBack.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            };
          }
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
        });
      } catch {
        // Fallback caso a restrição específica falhe
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
        } catch {
          onErro("Não foi possível acessar a câmera. Cole o JSON abaixo.");
          return;
        }
      }

      if (parado) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setLendo(true);

      // Tenta aplicar foco e zoom de 1x nativo se o hardware suportar
      const track = stream.getVideoTracks()[0];
      if (track) {
        trackRef.current = track;
        try {
          const trackWithCaps = track as MediaStreamTrack & {
            getCapabilities?: () => { zoom?: { min?: number; max?: number } };
            applyConstraints: (constraints: unknown) => Promise<void>;
          };
          const capabilities = trackWithCaps.getCapabilities?.() ?? {};
          if (capabilities.zoom) {
            setSuportaZoom(true);
            const minZ = capabilities.zoom.min ?? 1;
            const maxZ = capabilities.zoom.max ?? 1;
            // Garante foco de pelo menos 1.0x (evitando grande angular 0.5x)
            const targetZ = Math.max(1.0, minZ);
            const clamped = Math.min(targetZ, maxZ);
            setZoomAtual(clamped);
            await trackWithCaps.applyConstraints({
              advanced: [{ zoom: clamped, focusMode: "continuous" }],
            });
          }
        } catch {
          // Ignora se o navegador não permitir aplicar restrição de zoom
        }
      }

      const canvas = (canvasRef.current ??= document.createElement("canvas"));
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const varrer = () => {
        if (parado || !ctx) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dados = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const achado = jsQR(dados.data, dados.width, dados.height);
          if (achado?.data) {
            parado = true;
            onLeitura(achado.data);
            return;
          }
        }
        quadro = requestAnimationFrame(varrer);
      };
      quadro = requestAnimationFrame(varrer);
    }

    void iniciar();

    return () => {
      parado = true;
      cancelAnimationFrame(quadro);
      stream?.getTracks().forEach((t) => t.stop());
      trackRef.current = null;
      setLendo(false);
      setSuportaZoom(false);
    };
  }, [ativo, onLeitura, onErro]);

  async function alterarZoom(novoZoom: number) {
    if (!trackRef.current) return;
    try {
      const trackWithCaps = trackRef.current as MediaStreamTrack & {
        applyConstraints: (constraints: unknown) => Promise<void>;
      };
      await trackWithCaps.applyConstraints({
        advanced: [{ zoom: novoZoom }],
      });
      setZoomAtual(novoZoom);
    } catch {
      // Ignora erro
    }
  }

  if (!ativo) return null;

  return (
    <div className="mt-3">
      <div className="relative overflow-hidden rounded-md border-2 border-primary bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Visor da câmera para leitura de QR Code"
          className="aspect-square w-full object-cover"
        />

        {/* Controles de Zoom se suportado pelo dispositivo */}
        {suportaZoom && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {[1, 1.5, 2].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => alterarZoom(z)}
                className={`rounded-full px-3 py-1 text-xs font-extrabold shadow-md transition-all ${
                  Math.abs(zoomAtual - z) < 0.1
                    ? "bg-primary text-primary-foreground ring-2 ring-white"
                    : "bg-black/60 text-white hover:bg-black/80"
                }`}
              >
                {z}x
              </button>
            ))}
          </div>
        )}
      </div>
      <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">
        {lendo ? "Aponte a câmera para o QR Code da lista." : "Iniciando a câmera em 1x…"}
      </p>
    </div>
  );
}
