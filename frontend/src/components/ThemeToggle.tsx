"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem("dr-crop-theme") as "dark" | "light" | null;
    const sysPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    
    const initialTheme = savedTheme || (sysPrefersLight ? "light" : "dark");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("dr-crop-theme", newTheme);
  };

  if (!mounted) {
    return <div style={{ width: 32, height: 32 }} />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost"
      style={{
        padding: 6,
        borderRadius: "50%",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border)",
      }}
      aria-label="Toggle Theme"
      title="Toggle Theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
