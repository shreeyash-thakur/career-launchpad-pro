import { useEffect, useRef, useState } from "react";
import type { ResumeData, ResumeStyle } from "../types";
import { getTemplate } from "../templates";
import { PAGE_DIMENSIONS } from "../templates/resume-page";
import { useContainerWidth } from "../hooks/use-container-width";
import { useElementHeight } from "../hooks/use-element-height";
import { ZoomBar } from "./zoom-bar";
import { PageBreakOverlay } from "./page-break-overlay";

interface Props {
  data: ResumeData;
  style: ResumeStyle;
  onStyleChange: (updater: (prev: ResumeStyle) => ResumeStyle) => void;
}

const FIT_PADDING = 48;
const MIN_FONT_SCALE = 0.75;

export function ResumePreview({ data, style, onStyleChange }: Props) {
  const { ref: containerRef, width: containerWidth } = useContainerWidth<HTMLDivElement>();
  const pageRef = useRef<HTMLDivElement>(null);
  const dims = PAGE_DIMENSIONS[style.pageSize];

  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [shrinking, setShrinking] = useState(false);

  const fitZoom =
    containerWidth > 0 ? Math.min((containerWidth - FIT_PADDING) / dims.width, 1.5) : 1;
  const isFit = manualZoom === null;
  const zoom = isFit ? fitZoom : manualZoom / 100;

  const contentHeight = useElementHeight(pageRef, [data, style]);
  const pageCount = Math.max(1, Math.ceil((contentHeight || dims.height) / dims.height));

  // Iteratively shrink font size / line height until the résumé fits one page.
  useEffect(() => {
    if (!shrinking) return;
    if (contentHeight <= dims.height * 1.01 || style.fontScale <= MIN_FONT_SCALE) {
      setShrinking(false);
      return;
    }
    const t = setTimeout(() => {
      onStyleChange((prev) => ({
        ...prev,
        fontScale: Math.max(MIN_FONT_SCALE, Number((prev.fontScale - 0.02).toFixed(2))),
        lineHeight: Math.max(1.15, Number((prev.lineHeight - 0.008).toFixed(3))),
      }));
    }, 40);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shrinking, contentHeight, dims.height, style.fontScale]);

  const template = getTemplate(style.templateId);
  const scaledHeight = Math.max(contentHeight, dims.height) * zoom;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ZoomBar
        zoomPercent={zoom * 100}
        isFit={isFit}
        onZoomChange={(pct) => setManualZoom(pct)}
        onFitToWidth={() => setManualZoom(null)}
        pageCount={pageCount}
        onShrinkToFit={() => setShrinking(true)}
        shrinking={shrinking}
      />
      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle,theme(colors.border)_1px,transparent_1px)] [background-size:16px_16px]"
      >
        <div
          className="flex min-h-full justify-center px-6 py-8"
          style={{ width: "max-content", minWidth: "100%" }}
        >
          <div style={{ height: scaledHeight, width: dims.width * zoom }}>
            <div
              className="relative origin-top"
              style={{ transform: `scale(${zoom})`, width: dims.width }}
            >
              <template.Component data={data} style={style} pageRef={pageRef} />
              <PageBreakOverlay
                pageWidth={dims.width}
                pageHeight={dims.height}
                pageCount={pageCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
