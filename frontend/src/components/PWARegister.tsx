"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";

export default function PWARegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
