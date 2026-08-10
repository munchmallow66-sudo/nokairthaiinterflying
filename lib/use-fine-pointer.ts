"use client";

import * as React from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

/**
 * True only for real mouse/trackpad pointers. Used to skip hover-only effects
 * (3D tilt, spotlights, parallax) on touch devices, where they can never fire
 * but still cost compositing layers and per-frame work — the main reason the
 * public pages felt heavy on iOS Safari.
 *
 * Starts false so SSR and the first client render agree; it flips after mount.
 */
export function useFinePointer(): boolean {
  const [finePointer, setFinePointer] = React.useState(false);

  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const mql = window.matchMedia(QUERY);
    const update = () => setFinePointer(mql.matches);
    update();

    // Safari < 14 only has the deprecated addListener API.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return finePointer;
}
