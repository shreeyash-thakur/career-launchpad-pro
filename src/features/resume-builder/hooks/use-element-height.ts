import { useEffect, useState, type RefObject } from "react";

export function useElementHeight(ref: RefObject<HTMLElement | null>, deps: unknown[]) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeight(entry.target.scrollHeight);
    });
    observer.observe(el);
    setHeight(el.scrollHeight);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);

  return height;
}
