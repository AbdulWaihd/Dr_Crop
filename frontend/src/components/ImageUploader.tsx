"use client";

import { useRef, useState } from "react";

interface Props {
  onImageSelected: (file: File) => void;
  loading: boolean;
}

export default function ImageUploader({ onImageSelected, loading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  };

  return (
    <div className="w-full space-y-4">
      {/* Camera-first capture button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-2xl
                   transition-colors shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait
                   flex items-center justify-center gap-2 text-lg"
      >
        {loading ? (
          <>
            <Spinner />
            Analyzing...
          </>
        ) : (
          <>
            <CameraIcon />
            Take Photo or Upload
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />

      {/* Drag-and-drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-primary");
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove("border-primary")}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-primary");
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center text-muted text-sm
                   transition-colors cursor-pointer hover:border-primary/50"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto max-h-56 rounded-xl object-contain"
          />
        ) : (
          <p>Or drag &amp; drop a leaf image here</p>
        )}
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
