"use client";

import { useEffect } from "react";

export default function ThemeSync() {
  useEffect(() => {
    const saved = window.localStorage.getItem("theon-theme");
    document.documentElement.classList.toggle("light", saved === "light");
  }, []);

  return null;
}
