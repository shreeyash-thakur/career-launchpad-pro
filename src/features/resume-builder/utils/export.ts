import html2canvas from "html2canvas-pro";
import type { Options as Html2CanvasOptions } from "html2canvas-pro";
import { jsPDF } from "jspdf";
import type { PageSize } from "../types";
import { PAGE_DIMENSIONS } from "../templates/resume-page";

export type ExportFormat = "pdf" | "png" | "jpg";

/** Crisp on retina screens without producing an unreasonably large capture. */
const PIXEL_RATIO = 2;
/** How many capture attempts (with escalating fallback options) before giving up. */
const MAX_CAPTURE_ATTEMPTS = 4;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForLayoutAndFonts(node: HTMLElement) {
  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, wait(1500)]);
  }

  void node.offsetHeight;
  void node.offsetWidth;

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  await wait(50);
}

async function captureNode(
  node: HTMLElement,
  options: Partial<Html2CanvasOptions>,
): Promise<HTMLCanvasElement | null> {
  const canvas = await html2canvas(node, options);
  return isBlank(canvas) ? null : canvas;
}

function isBlank(canvas: HTMLCanvasElement): boolean {
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext("2d");
  } catch {
    return false;
  }
  if (!ctx) return false;

  const { width, height } = canvas;
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return false;
  }

  const step = 32;
  let colored = 0;
  let total = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const a = data[i + 3] ?? 0;
      total++;
      if (a > 40 && (r < 245 || g < 245 || b < 245)) colored++;
    }
  }
  if (total === 0) return true;
  return colored / total < 0.005;
}

async function captureWithRetry(node: HTMLElement): Promise<HTMLCanvasElement> {
  const baseOptions: Partial<Html2CanvasOptions> = {
    scale: PIXEL_RATIO,
    backgroundColor: "#ffffff",
    useCORS: true,
  };
  const fallbackOptions: Partial<Html2CanvasOptions>[] = [
    { ...baseOptions, foreignObjectRendering: true },
    baseOptions,
    { ...baseOptions, scale: 1 },
    { ...baseOptions, scale: 1, allowTaint: true, useCORS: false },
  ];

  let fullCanvas: HTMLCanvasElement | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_CAPTURE_ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) await wait(100);
      fullCanvas = await captureNode(node, fallbackOptions[attempt] ?? baseOptions);
      if (fullCanvas) break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!fullCanvas) {
    throw new Error(
      lastError instanceof Error
        ? `Could not render the resume for download (${lastError.message}).`
        : "Could not render the resume for download.",
    );
  }
  return fullCanvas;
}

function sliceIntoPages(source: HTMLCanvasElement, pageWidthPx: number, pageHeightPx: number) {
  const pageCount = Math.max(1, Math.ceil(source.height / pageHeightPx - 0.01));
  const pages: HTMLCanvasElement[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = document.createElement("canvas");
    page.width = pageWidthPx;
    page.height = pageHeightPx;
    const ctx = page.getContext("2d");
    if (!ctx) continue;

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
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function printResume(pageSize?: PageSize) {
  if (typeof window !== "undefined") {
    window.print();
  }
}

export async function downloadResume(
  node: HTMLElement,
  pageSize: PageSize,
  format: ExportFormat,
  filenameBase: string,
) {
  await waitForLayoutAndFonts(node);

  const dims = PAGE_DIMENSIONS[pageSize];
  const fullCanvas = await captureWithRetry(node);

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