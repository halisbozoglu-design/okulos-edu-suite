import { Camera, LoaderCircle, ShieldAlert, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { extractIdentityReading, isStableIdentityReadings, type IdentityReading } from "@/lib/visitor-security";

type OcrWorker = { recognize: (image: HTMLCanvasElement) => Promise<{ data: { text: string } }>; terminate: () => Promise<unknown> };

export function LiveIdCardScanner({ onStableReading, onClose }: { onStableReading: (reading: IdentityReading) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<OcrWorker | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeRef = useRef(true);
  const readingsRef = useRef<IdentityReading[]>([]);
  const [status, setStatus] = useState("Kamera hazırlanıyor…");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    activeRef.current = true;
    let initializing = true;
    async function start() {
      if (!window.isSecureContext) {
        setError("Canlı kamera yalnızca güvenli bağlantıda (HTTPS) kullanılabilir. Manuel doğrulama seçeneğini kullanın.");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Bu tarayıcı kamera erişimini desteklemiyor. Manuel doğrulama seçeneğini kullanın.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        if (!activeRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus("Kartı çerçeveye yerleştirin; fotoğraf çekilmez.");
        const { createWorker } = await import("tesseract.js");
        workerRef.current = (await createWorker("eng")) as unknown as OcrWorker;
        if (!activeRef.current) return;
        initializing = false;
        timerRef.current = window.setInterval(() => { void inspectFrame(); }, 1000);
        void inspectFrame();
      } catch (cause) {
        const name = cause instanceof DOMException ? cause.name : "";
        setError(name === "NotAllowedError" ? "Kamera izni verilmedi. Tarayıcı ayarlarından kamera iznini açın veya manuel doğrulama kullanın." : "Kamera açılamadı. Işık ve odak koşullarını kontrol edin veya manuel doğrulama kullanın.");
      }
    }
    async function inspectFrame() {
      if (!activeRef.current || initializing || working || !videoRef.current || !canvasRef.current || !workerRef.current) return;
      const video = videoRef.current;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      setWorking(true);
      const canvas = canvasRef.current;
      const width = Math.max(640, Math.floor(video.videoWidth * 0.82));
      const height = Math.max(404, Math.floor(width * 0.6301));
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) { setWorking(false); return; }
      const sx = Math.max(0, (video.videoWidth - width) / 2);
      const sy = Math.max(0, (video.videoHeight - height) / 2);
      context.drawImage(video, sx, sy, width, height, 0, 0, width, height);
      try {
        const result = await workerRef.current.recognize(canvas);
        if (!activeRef.current) return;
        const reading = extractIdentityReading(result.data.text);
        if (reading) {
          readingsRef.current = [...readingsRef.current.slice(-1), reading];
          setStatus(isStableIdentityReadings(readingsRef.current) ? "Kimlik okuması sabitlendi." : "Kimlik okunuyor; aynı sonucu tekrar bekleniyor…");
          if (isStableIdentityReadings(readingsRef.current)) onStableReading(reading);
        } else {
          setStatus("Kartı çerçevede sabit ve aydınlık tutun.");
        }
      } catch {
        setStatus("Kart okunamadı; ışık ve odağı kontrol edin.");
      } finally {
        setWorking(false);
      }
    }
    void start();
    return () => {
      activeRef.current = false;
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      const worker = workerRef.current;
      workerRef.current = null;
      if (worker) void worker.terminate();
      const context = canvasRef.current?.getContext("2d");
      if (context && canvasRef.current) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
  }, [onStableReading, working]);

  return <div className="fixed inset-0 z-50 flex min-h-screen flex-col bg-background">
    <div className="flex items-center justify-between border-b px-4 py-3"><div className="flex items-center gap-2"><Camera className="size-5 text-primary"/><div><p className="font-semibold">Canlı kimlik okuyucu</p><p className="text-xs text-muted-foreground">Kart görüntüsü kaydedilmez veya gönderilmez.</p></div></div><Button variant="outline" onClick={onClose}>Kapat</Button></div>
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-muted shadow-sm"><video ref={videoRef} playsInline autoPlay muted className="aspect-video w-full object-cover"/><div className="pointer-events-none absolute inset-0 grid place-items-center p-5"><div className="aspect-[856/540] w-full max-w-[82%] rounded-xl border-2 border-primary/80 shadow-[0_0_0_9999px_var(--color-background)] opacity-90"><span className="sr-only">ID-1 kart çerçevesi</span></div></div></div>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true"/>
      <div className="flex max-w-lg items-center gap-2 text-center text-sm text-muted-foreground">{working ? <LoaderCircle className="size-4 animate-spin"/> : <Square className="size-3 fill-current"/>}{status}</div>
      {error ? <div role="alert" className="flex max-w-lg items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><ShieldAlert className="mt-0.5 size-4 shrink-0"/>{error}</div> : null}
      <p className="max-w-lg text-center text-xs text-muted-foreground">Fotoğraf/shutter yoktur. Yalnızca kart çerçevesindeki geçici görüntü yaklaşık saniyede bir OCR için işlenir.</p>
    </div>
  </div>;
}
