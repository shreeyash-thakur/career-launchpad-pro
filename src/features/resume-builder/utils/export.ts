import type { PageSize } from "../types";

/** Injects a temporary @page rule so the print dialog defaults to the right paper size, then opens print. */
export function printResume(pageSize: PageSize) {
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-print-page-size", "true");
  styleEl.textContent = `@page { size: ${pageSize === "a4" ? "A4" : "letter"}; margin: 0; }`;
  document.head.appendChild(styleEl);

  const cleanup = () => {
    styleEl.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  // Give the browser a tick to apply the injected stylesheet before printing.
  requestAnimationFrame(() => window.print());
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
