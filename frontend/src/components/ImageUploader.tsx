"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { useRef, useState, useCallback, useEffect } from "react";

interface Props {
  onImageSelected: (file: File) => void;
  loading: boolean;
  preview: string | null;
  setPreview: (p: string | null) => void;
}

export default function ImageUploader({
  onImageSelected,
  loading,
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
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <button
          type="button"
          onClick={startLiveCamera}
          disabled={loading || cameraOpen}
          className="btn-primary"
          style={{ fontSize: 14 }}
        >
          <CameraIcon />           {t("uploadLiveCamera")}
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: 14 }}
        >
          <CameraIcon /> {t("uploadQuickCapture")}
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          id="btn-gallery-upload"
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={loading}
          className="btn-secondary"
          style={{ flex: 1 }}
        >
          <GalleryIcon />
          {t("uploadGallery")}
        </button>
      </div>

      {cameraError && (
        <p
          style={{
            fontSize: 12,
            color: "var(--warning)",
            marginBottom: 10,
            padding: "8px 12px",
            background: "rgba(250,204,21,0.08)",
            borderRadius: 10,
            border: "1px solid rgba(250,204,21,0.25)",
          }}
        >
          {cameraError}
        </p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: "none" }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: "none" }}
      />

      {cameraOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{ width: "100%", maxWidth: 480, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
            <video ref={videoRef} playsInline muted autoPlay className="w-full aspect-video object-cover" style={{ display: "block", background: "#000" }} />
            <div style={{ display: "flex", gap: 8, padding: 12, background: "var(--surface)" }}>
              <button type="button" onClick={captureFrame} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                {t("uploadCaptureCrop")}
              </button>
              <button type="button" onClick={stopLiveCamera} className="btn-ghost">
                {t("cameraCancel")}
              </button>
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 12, textAlign: "center", maxWidth: 400 }}>
            {t("cameraOverlayHelp")}
          </p>
        </div>
      )}

      <div
        className={`drop-zone${isDragging ? " active" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => galleryInputRef.current?.click()}
        id="drop-zone-area"
      >
        {preview ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              style={{
                maxHeight: 220,
                maxWidth: "100%",
                borderRadius: 12,
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
              }}
            />
            {loading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10,15,13,0.7)",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <SpinnerIcon size={36} />
                <p style={{ color: "var(--green-400)", fontSize: 13, fontWeight: 600 }}>
                  {t("uploadAnalyzing")}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "var(--green-glow)",
                border: "1px solid rgba(74,222,128,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
              }}
            >
              🍃
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              {t("uploadDrop")}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {t("uploadFormats")}
            </p>
          </div>
        )}
      </div>

      {!preview && (
        <div
          id="crops"
          style={{
            marginTop: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
          }}
          className="animate-fade-in delay-200"
        >
          {["🌽 Corn", "🍅 Tomato", "🥔 Potato", "🍇 Grape", "🌾 Wheat", "🍎 Apple"].map((crop) => (
            <span key={crop} className="feature-pill" style={{ fontSize: 12 }}>
              {crop}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}>
      <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

function SpinnerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
