import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeData, ResumeStyle } from "../types";
import { defaultStyle, sampleResume } from "../sample-data";

const DATA_KEY = "resume-builder:data:v1";
const STYLE_KEY = "resume-builder:style:v1";
const HISTORY_LIMIT = 40;

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type SaveStatus = "idle" | "saving" | "saved";

/** Backfills fields added after a résumé may have been saved, so old saved data keeps working. */
function migrateData(data: ResumeData): ResumeData {
  if (data.hiddenSections) return data;
  return { ...data, hiddenSections: [] };
}

/** Backfills style fields added after a style may have been saved. */
function migrateStyle(style: ResumeStyle): ResumeStyle {
  if (style.bulletStyle && style.sectionDividers) return style;
  return {
    ...style,
    bulletStyle: style.bulletStyle ?? "template",
    sectionDividers: style.sectionDividers ?? "template",
  };
}

export function useResumeStore() {
  const [data, setDataState] = useState<ResumeData>(() =>
    migrateData(readStorage(DATA_KEY, sampleResume())),
  );
  const [style, setStyleState] = useState<ResumeStyle>(() =>
    migrateStyle(readStorage(STYLE_KEY, defaultStyle())),
  );
  const [status, setStatus] = useState<SaveStatus>("idle");

  const undoStack = useRef<ResumeData[]>([]);
  const redoStack = useRef<ResumeData[]>([]);
  const skipHistory = useRef(false);
  const [, forceRender] = useState(0);

  const setData = useCallback((updater: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setDataState((prev) => {
      const next =
        typeof updater === "function" ? (updater as (p: ResumeData) => ResumeData)(prev) : updater;
      if (!skipHistory.current) {
        undoStack.current.push(prev);
        if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
        redoStack.current = [];
      }
      skipHistory.current = false;
      forceRender((n) => n + 1);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setDataState((prev) => {
      const last = undoStack.current.pop();
      if (!last) return prev;
      redoStack.current.push(prev);
      skipHistory.current = true;
      forceRender((n) => n + 1);
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    setDataState((prev) => {
      const next = redoStack.current.pop();
      if (!next) return prev;
      undoStack.current.push(prev);
      skipHistory.current = true;
      forceRender((n) => n + 1);
      return next;
    });
  }, []);

  const setStyle = useCallback((updater: ResumeStyle | ((prev: ResumeStyle) => ResumeStyle)) => {
    setStyleState((prev) =>
      typeof updater === "function" ? (updater as (p: ResumeStyle) => ResumeStyle)(prev) : updater,
    );
  }, []);

  const resetToSample = useCallback(() => {
    setData(sampleResume());
  }, [setData]);

  const resetToBlank = useCallback(
    (blank: ResumeData) => {
      setData(blank);
    },
    [setData],
  );

  // Debounced autosave.
  useEffect(() => {
    setStatus("saving");
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
        window.localStorage.setItem(STYLE_KEY, JSON.stringify(style));
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [data, style]);

  return {
    data,
    setData,
    style,
    setStyle,
    status,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    resetToSample,
    resetToBlank,
  };
}
