import { useEffect, useState } from "react";

/**
 * True on devices that have a mouse-like pointer (hover + fine precision).
 * Used to gate cursor-tracked effects (3D tilt, spotlight glows, parallax)
 * that only make sense with a mouse — on touch devices they never trigger
 * the way they're designed to, and just cost battery/GPU for nothing.
 */
export function useFinePointer() {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setIsFine(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isFine;
}
