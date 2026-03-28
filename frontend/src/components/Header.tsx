"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        background: "rgba(10, 15, 13, 0.85)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border-bright)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 20px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="animate-pulse-glow"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #16a34a, #4ade80)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🌿
          </div>
          <div>
            <h1
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Dr. Crop
            </h1>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1 }}>
              AI Disease Detection
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a
            href="#how-it-works"
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              fontSize: 13,
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "all 0.2s",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "var(--text-secondary)";
              (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "var(--text-muted)";
              (e.target as HTMLElement).style.background = "transparent";
            }}
          >
            How It Works
          </a>
          <a
            href="#crops"
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              fontSize: 13,
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "all 0.2s",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "var(--text-secondary)";
              (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "var(--text-muted)";
              (e.target as HTMLElement).style.background = "transparent";
            }}
          >
            Diseases
          </a>
          <div
            style={{
              width: 1,
              height: 20,
              background: "var(--border-bright)",
              margin: "0 6px",
            }}
          />
          <div
            className="badge badge-success"
            style={{ fontSize: 11 }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--success)",
                display: "inline-block",
              }}
            />
            AI Online
          </div>
        </nav>
      </div>
    </header>
  );
}
