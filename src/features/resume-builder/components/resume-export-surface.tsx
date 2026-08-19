import { useRef, useState, useCallback, useMemo, type ReactPortal } from "react";
import { createPortal } from "react-dom";
import type { ResumeData, ResumeStyle } from "../types";
import { getTemplate } from "../templates";
import { downloadResume, type ExportFormat } from "../utils/export";

interface UseResumeExportResult {
  /** Mount this once, anywhere, in the component that calls the hook. */
  ExportSurface: () => ReactPortal | null;
  download: (format: ExportFormat) => Promise<void>;
  exporting: ExportFormat | null;
}

/**
 * Renders the résumé a second time — at its real, unscaled size, off-screen
 * — purely so export has a clean, always-visible-to-the-renderer node to
 * capture. The on-screen preview can be zoomed, mid-transition between the
 * mobile Edit/Preview tabs, or simply not mounted on the current route at
 * all; none of that should affect what gets downloaded.
 *
 * "Off-screen" here means shifted outside the viewport with `position:
 * fixed`, not `display: none` — hidden elements have no layout box, so a
 * canvas capture of one silently produces a blank page.
 */
export function useResumeExport(
  data: ResumeData,
  style: ResumeStyle,
  filenameBase: string,
): UseResumeExportResult {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const template = getTemplate(style.templateId);

  // Keep a ref to the latest style/filenameBase so the download callback
  // always reads current values without needing to be re-created each render.
  // (Re-creating the callback would be fine, but a ref avoids any stale-
  // closure risk in callers that memoize the function reference.)
  const styleRef = useRef(style);
  const filenameRef = useRef(filenameBase);
  styleRef.current = style;
  filenameRef.current = filenameBase;

  const download = useCallback(async (format: ExportFormat) => {
    const node = nodeRef.current;
    if (!node) throw new Error("Resume isn't ready to export yet.");
    setExporting(format);
    try {
      await downloadResume(node, styleRef.current.pageSize, format, filenameRef.current);
    } finally {
      setExporting(null);
    }
  }, []); // stable reference — reads live values via refs

  // IMPORTANT: ExportSurface must be a stable component reference, NOT an
  // inline function defined inside useResumeExport. If it were inline, React
  // would see a new component type on every render, unmount and remount the
  // hidden node each time, and the ref would always be null when download()
  // is called — producing a blank PDF. We stabilise it with useMemo so React
  // keeps the same component identity across re-renders.
  const ExportSurface = useMemo(() => {
    // Capture what we need at creation time; updates flow through the refs above.
    function ExportSurfaceComponent(): ReactPortal | null {
      if (typeof document === "undefined") return null;
      return createPortal(
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: "-10000px",
            // Layout still runs at full fidelity here; this only moves the
            // box out of the viewport so nothing is visibly shown or
            // scrollable to the person using the page.
            pointerEvents: "none",
          }}
        >
          <template.Component data={data} style={style} pageRef={nodeRef} />
        </div>,
        document.body,
      );
    }
    return ExportSurfaceComponent;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.Component, data, style]);

  return { ExportSurface, download, exporting };
}