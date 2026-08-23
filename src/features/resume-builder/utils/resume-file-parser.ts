/**
 * Extracts plain text from an uploaded resume file (PDF or DOCX) entirely
 * in the browser — the raw file never leaves the client. Both parsing
 * libraries are dynamically imported so they only load when someone
 * actually opens the upload flow, not as part of the main app bundle.
 */

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export class ResumeFileError extends Error {}

function getExtension(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return "docx";
  }
  return "";
}

async function extractPdfText(file: File): Promise<string> {
  const [pdfjsLib, workerUrl] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url").then((m) => m.default),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pageTexts.push(text);
  }
  return pageTexts.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/**
 * Reads a PDF or DOCX File and returns its plain text content. Throws
 * ResumeFileError with a user-facing message for unsupported types,
 * oversized files, or files that fail to parse (corrupted/scanned/
 * password-protected).
 */
export async function extractTextFromResumeFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ResumeFileError("File is too large — please upload a resume under 8MB.");
  }

  const ext = getExtension(file);
  if (!ext) {
    throw new ResumeFileError("Unsupported file type — please upload a PDF or DOCX resume.");
  }

  let text: string;
  try {
    text = ext === "pdf" ? await extractPdfText(file) : await extractDocxText(file);
  } catch {
    throw new ResumeFileError(
      "Couldn't read that file — it may be corrupted, password-protected, or a scanned image without selectable text.",
    );
  }

  const cleaned = text
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (cleaned.length < 40) {
    throw new ResumeFileError(
      "Couldn't find readable text in that file — if it's a scanned image, try uploading a text-based PDF or DOCX instead.",
    );
  }
  return cleaned;
}
