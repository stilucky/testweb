"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/store/localeStore";

/** Runs geo-detection once on first visit. Renders nothing. */
export default function LocaleInit() {
  const initFromGeo = useLocaleStore((s) => s.initFromGeo);

  useEffect(() => {
    initFromGeo();
  }, [initFromGeo]);

  return null;
}
