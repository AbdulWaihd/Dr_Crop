"use client";

import { useRef, useState, useCallback } from "react";

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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Upload buttons row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {/* Camera button */}
        <button
          id="btn-camera-upload"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <SpinnerIcon />
              Analyzing leaf...
            </>
          ) : (
            <>
              <CameraIcon />
              Take Photo
            </>
          )}
        </button>

        {/* Gallery button */}
        <button
          id="btn-gallery-upload"
          onClick={() => galleryInputRef.current?.click()}
          disabled={loading}
          className="btn-secondary"
          style={{ flex: 1 }}
        >
          <GalleryIcon />
          From Gallery
        </button>
      </div>

      {/* Hidden inputs */}
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

      {/* Drop zone */}
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
              alt="Leaf preview"
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
                  AI is analyzing your leaf...
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
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Drop a leaf image here
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              or click one of the buttons above · JPG, PNG, WebP supported
            </p>
          </div>
        )}
      </div>

      {/* Sample crops tags */}
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
          {["🌽 Corn", "🍅 Tomato", "🥔 Potato", "🍇 Grape", "🌾 Wheat", "🍎 Apple"].map(
            (crop) => (
              <span key={crop} className="feature-pill" style={{ fontSize: 12 }}>
                {crop}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 15l5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

function SpinnerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        fill="currentColor"
        opacity="0.75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
