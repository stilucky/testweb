"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 180;
const SAFETY_TIMEOUT_MS = 15000;

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [visible, setVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const navigatingRef = useRef(false);
  const startedAtRef = useRef(0);
  const hideTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
    hideTimerRef.current = null;
    safetyTimerRef.current = null;
  }, []);

  const finishNavigation = useCallback(() => {
    if (!navigatingRef.current) return;

    const elapsed = performance.now() - startedAtRef.current;
    const finishDelay = Math.max(0, MIN_VISIBLE_MS - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      setCompleting(true);
      hideTimerRef.current = window.setTimeout(() => {
        navigatingRef.current = false;
        setVisible(false);
        setCompleting(false);
        clearTimers();
      }, 260);
    }, finishDelay);
  }, [clearTimers]);

  const startNavigation = useCallback(() => {
    clearTimers();
    navigatingRef.current = true;
    startedAtRef.current = performance.now();
    setCompleting(false);
    setVisible(true);

    safetyTimerRef.current = window.setTimeout(() => {
      finishNavigation();
    }, SAFETY_TIMEOUT_MS);
  }, [clearTimers, finishNavigation]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.protocol !== "http:" && destination.protocol !== "https:") return;

      const currentRoute = `${window.location.pathname}${window.location.search}`;
      const destinationRoute = `${destination.pathname}${destination.search}`;
      if (destinationRoute === currentRoute) return;

      startNavigation();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startNavigation]);

  useEffect(() => {
    if (!navigatingRef.current) return;
    const finishTimer = window.setTimeout(finishNavigation, 0);
    return () => window.clearTimeout(finishTimer);
  }, [routeKey, finishNavigation]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="navigation-progress"
      data-completing={completing ? "true" : "false"}
    />
  );
}
