import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface Options {
  /** Target value to count to. */
  to: number;
  /** Duration in ms. */
  duration?: number;
}

/**
 * Counts from 0 to `to` once the element scrolls into view.
 * Returns the ref to attach and the current value.
 */
export function useCountUp({ to, duration = 1600 }: Options) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo for a premium settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(to * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  return { ref, value };
}
