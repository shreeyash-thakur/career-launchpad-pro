import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import type { PageSize } from "../types";
import { PAGE_DIMENSIONS } from "../templates/resume-page";

export type ExportFormat = "pdf" | "png" | "jpg";

/** Crisp on retina screens without producing an unreasonably large capture. */
const PIXEL_RATIO = 2;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sliceIntoPages(source: HTMLCanvasElement, pageWidthPx: number, pageHeightPx: number) {
  // A tiny tolerance (matching the on-screen preview's own fit-check) so a
  // resume that overflows the last page by a couple of stray pixels doesn't
  // spawn an extra, almost-empty page.
  const pageCount = Math.max(1, Math.ceil(source.height / pageHeightPx - 0.01));
  const pages: HTMLCanvasElement[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = document.createElement("canvas");
    page.width = pageWidthPx;
    page.height = pageHeightPx;
    const ctx = page.getContext("2d");
    if (!ctx) continue;

    // White backdrop first: the last page is usually shorter than a full
    // page's worth of content, and this fills the remainder cleanly instead
    // of leaving a transparent/black gap.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, page.width, page.height);

    const sourceY = i * pageHeightPx;
    const sourceHeight = Math.min(pageHeightPx, source.height - sourceY);
    if (sourceHeight > 0) {
      ctx.drawImage(source, 0, sourceY, source.width, sourceHeight, 0, 0, page.width, sourceHeight);
    }
    pages.push(page);
  }

  return pages;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not generate image data from the resume."));
      },
      mime,
      quality,
    );
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to actually start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Captures a resume page node (rendered at its natural, unscaled size — not
 * the zoomed/scaled preview) and turns it into an actual downloadable file:
 * a real multi-page PDF, or one PNG/JPG per page. This never opens the
 * browser's print dialog, so it behaves identically on mobile and desktop.
 */
export async function downloadResume(
  node: HTMLElement,
  pageSize: PageSize,
  format: ExportFormat,
  filenameBase: string,
) {
  // Wait for web fonts so the capture doesn't fall back to system fonts.
  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, wait(1500)]);
  }

  const dims = PAGE_DIMENSIONS[pageSize];
  const fullCanvas = await html2canvas(node, {
    scale: PIXEL_RATIO,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const pageWidthPx = Math.round(dims.width * PIXEL_RATIO);
  const pageHeightPx = Math.round(dims.height * PIXEL_RATIO);
  const pages = sliceIntoPages(fullCanvas, pageWidthPx, pageHeightPx);
  const safeName = (filenameBase || "resume").trim().replace(/[\\/:*?"<>|]+/g, "-");

  if (format === "pdf") {
    const pdf = new jsPDF({
      unit: "px",
      format: [dims.width, dims.height],
      hotfixes: ["px_scaling"],
      compress: true,
    });
    pages.forEach((page, index) => {
      if (index > 0) pdf.addPage([dims.width, dims.height]);
      pdf.addImage(
        page.toDataURL("image/png"),
        "PNG",
        0,
        0,
        dims.width,
        dims.height,
        undefined,
        "FAST",
      );
    });
    pdf.save(`${safeName}.pdf`);
    return;
  }

  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const ext = format === "jpg" ? "jpg" : "png";
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (!page) continue;
    const blob = await canvasToBlob(page, mime, format === "jpg" ? 0.95 : undefined);
    const filename = pages.length > 1 ? `${safeName}-page-${i + 1}.${ext}` : `${safeName}.${ext}`;
    downloadBlob(blob, filename);
    // Most browsers block/flag rapid back-to-back downloads as a popup
    // storm; a short gap keeps every page landing in the Downloads folder.
    if (i < pages.length - 1) await wait(300);
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, filename);
}

export function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as T);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}
