import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeData, ResumeStyle } from "../types";
import { defaultStyle, sampleResume } from "../sample-data";
import { ResumeService, type FirestoreResume } from "@/lib/resume-service";

const DATA_KEY = "peasiprofile:builder:data:v1";
const STYLE_KEY = "peasiprofile:builder:style:v1";
const TITLE_KEY = "peasiprofile:builder:title:v1";
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

export interface UseResumeStoreOptions {
  resumeId?: string;
  userId?: string;
  initialResume?: FirestoreResume | null;
}

export function useResumeStore(options: UseResumeStoreOptions = {}) {
  const { resumeId, userId, initialResume } = options;

  const [title, setTitleState] = useState<string>(() => {
    if (initialResume?.title) return initialResume.title;
    return readStorage(TITLE_KEY, "My Professional Resume");
  });

  const [data, setDataState] = useState<ResumeData>(() => {
    if (initialResume?.resumeData) return initialResume.resumeData;
    return readStorage(DATA_KEY, sampleResume());
  });

  const [style, setStyleState] = useState<ResumeStyle>(() => {
    if (initialResume?.resumeStyle) return initialResume.resumeStyle;
    return readStorage(STYLE_KEY, defaultStyle());
  });

  const [status, setStatus] = useState<SaveStatus>("idle");

  const undoStack = useRef<ResumeData[]>([]);
  const redoStack = useRef<ResumeData[]>([]);
  const skipHistory = useRef(false);
  const [, forceRender] = useState(0);

  // Sync if initialResume loads asynchronously
  useEffect(() => {
    if (initialResume) {
      if (initialResume.title) setTitleState(initialResume.title);
      if (initialResume.resumeData) setDataState(initialResume.resumeData);
      if (initialResume.resumeStyle) setStyleState(initialResume.resumeStyle);
    }
  }, [initialResume]);

  const setTitle = useCallback((newTitle: string) => {
    setTitleState(newTitle);
  }, []);

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

  // Debounced autosave to Local Storage and Firestore
  useEffect(() => {
    setStatus("saving");
    const t = setTimeout(async () => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(TITLE_KEY, JSON.stringify(title));
          window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
          window.localStorage.setItem(STYLE_KEY, JSON.stringify(style));
        }

        if (resumeId && userId) {
          await ResumeService.updateResume(resumeId, userId, {
            title,
            templateId: style.templateId,
            resumeData: data,
            resumeStyle: style,
          });
        }
        setStatus("saved");
      } catch (err) {
        console.warn("Autosave notice:", err);
        setStatus("idle");
      }
    }, 500);

    return () => clearTimeout(t);
  }, [data, style, title, resumeId, userId]);

  return {
    title,
    setTitle,
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
