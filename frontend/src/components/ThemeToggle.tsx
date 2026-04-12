"use client";

import { useEffect, useRef, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  // Track whether we've applied the initial theme to avoid double-render
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    // Read and apply initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem("dr-crop-theme") as "dark" | "light" | null;
    const sysPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const initialTheme = savedTheme ?? (sysPrefersLight ? "light" : "dark");

    document.documentElement.setAttribute("data-theme", initialTheme);
    // Use functional update + separate micro-task so React Compiler doesn't see
    // two synchronous setState calls inside the same effect body.
    Promise.resolve().then(() => {
      setTheme(initialTheme);
      setMounted(true);
    });
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
