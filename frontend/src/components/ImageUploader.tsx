"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { 
  Camera, 
  Image as ImageIcon, 
  Upload, 
  Leaf, 
  Loader2, 
  Zap,
  X,
  AlertCircle
} from "lucide-react";

interface Props {
  onImageSelected: (file: File) => void;
  loading: boolean;
  loadingStatus?: string;
  preview: string | null;
  setPreview: (p: string | null) => void;
}

export default function ImageUploader({
  onImageSelected,
  loading,
  loadingStatus,
  preview,
  setPreview,
}: Props) {

  const { t } = useLocale();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastPreviewRef = useRef<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (lastPreviewRef.current) URL.revokeObjectURL(lastPreviewRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;
      if (lastPreviewRef.current) {
        URL.revokeObjectURL(lastPreviewRef.current);
        lastPreviewRef.current = null;
      }
      const url = URL.createObjectURL(file);
      lastPreviewRef.current = url;
      setPreview(url);
      onImageSelected(file);
    },
    [setPreview, onImageSelected]
  );

  const stopLiveCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setCameraError(null);
  }, []);

  const startLiveCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t("errCameraApi"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        const el = videoRef.current;
        if (el) {
          el.srcObject = stream;
          el.play().catch(() => {});
        }
      });
    } catch {
      setCameraError(t("errCameraPermission"));
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `crop-${Date.now()}.jpg`, { type: "image/jpeg" });
        stopLiveCamera();
        handleFile(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
       e.preventDefault();
       setIsDragging(false);
       if (loading) return;
       handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile, loading]
  );

  return (
    <div className="w-full flex flex-col items-center">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
        <button
          onClick={startLiveCamera}
          disabled={loading || cameraOpen}
          className="flex items-center justify-center gap-3 bg-primary text-on-primary py-4 rounded-full font-bold shadow-md hover:bg-primary-dim transition-all disabled:opacity-50"
        >
          <Camera size={20} />
          {t("uploadLiveCamera")}
        </button>
        <button
          onClick={() => galleryInputRef.current?.click()}
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-surface-container-high text-on-surface py-4 rounded-full font-bold border border-outline-variant/15 hover:bg-surface-container-highest transition-all disabled:opacity-50"
        >
          <ImageIcon size={20} />
          {t("uploadGallery")}
        </button>
      </div>

      {/* Drop Zone / Preview */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !preview && !loading && galleryInputRef.current?.click()}
        className={`w-full min-h-[260px] sm:min-h-[340px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer overflow-hidden relative ${
          isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-high'
        }`}
      >
        {preview ? (
          <div className="w-full h-full min-h-[260px] sm:min-h-[340px] relative">
            <Image
              src={preview}
              alt="Crop Scan"
              fill
              className="object-cover"
              unoptimized
            />
            {loading && (
              <div className="absolute inset-0 bg-surface-dim/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-20">
                <div className="relative">
                   <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                   <Loader2 size={56} className="animate-spin text-primary relative z-10" />
                </div>
                <div className="text-center">
                   <p className="text-on-surface font-black text-xl tracking-tight mb-2">
                     {t((loadingStatus as any) || "uploadAnalyzing")}
                   </p>
                   <div className="w-48 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mx-auto">
                     <div className="h-full bg-primary animate-progress-glow"></div>
                   </div>
                </div>
              </div>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setPreview(null); }}
              className="absolute top-6 right-6 bg-error text-on-error p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        ) : (
          <div className="text-center p-10">
            <div className="w-24 h-24 bg-primary-container/20 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Upload size={40} strokeWidth={2.5} />
            </div>
            <h4 className="text-2xl font-black text-on-surface mb-3 tracking-tight">{t("uploadDrop")}</h4>
            <p className="text-on-surface-variant text-sm max-w-[260px] mx-auto font-medium leading-relaxed">{t("uploadFormats")}</p>
          </div>
        )}
      </div>

      <input ref={galleryInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />

      {/* Camera Overlay */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="w-full max-w-2xl bg-surface-container-lowest rounded-[3rem] overflow-hidden shadow-2xl border border-outline-variant/20">
              <div className="relative aspect-video bg-black">
                <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[50px] border-black/40 pointer-events-none">
                  <div className="w-full h-full border border-primary/40 relative">
                     <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-primary rounded-tl-xl"></div>
                     <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-primary rounded-tr-xl"></div>
                     <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-primary rounded-bl-xl"></div>
                     <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-primary rounded-br-xl"></div>
                  </div>
                </div>
              </div>
              <div className="p-10 flex items-center justify-between gap-8">
                 <button onClick={stopLiveCamera} className="w-20 h-20 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-all active:scale-90">
                    <X size={32} />
                 </button>
                 <button onClick={captureFrame} className="flex-1 h-20 rounded-full bg-primary text-on-primary font-black text-2xl flex items-center justify-center gap-4 shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all active:translate-y-0">
                    <Camera size={32} />
                    {t("uploadCaptureCrop")}
                 </button>
              </div>
           </div>
           <div className="mt-10 flex items-center gap-3 text-white/60 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
              <Zap size={18} className="text-primary" />
              <p className="text-sm font-bold tracking-tight uppercase whitespace-nowrap">{t("cameraOverlayHelp")}</p>
           </div>
        </div>
      )}

      {cameraError && (
        <div className="mt-8 flex items-center gap-3 text-error bg-error-container/10 px-6 py-4 rounded-2xl border border-error/20 animate-bounce">
          <AlertCircle size={20} />
          <span className="text-sm font-bold">{cameraError}</span>
        </div>
      )}
    </div>
  );
}
