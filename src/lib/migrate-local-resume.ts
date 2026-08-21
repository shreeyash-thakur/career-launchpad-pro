import type { ResumeData, ResumeStyle } from "@/features/resume-builder/types";
import { createResume } from "@/lib/resume-service";
import { defaultStyle } from "@/features/resume-builder/sample-data";

const DATA_KEY = "resume-builder:data:v1";
const STYLE_KEY = "resume-builder:style:v1";
const MIGRATION_FLAG = "resume-builder:migrated:v1";

interface LocalResumeData {
  data: ResumeData;
  style: ResumeStyle;
}

/**
 * Reads the existing localStorage resume (if any) without deleting it.
 * Returns null if no valid local resume exists.
 */
export function readLocalResume(): LocalResumeData | null {
  if (typeof window === "undefined") return null;
  try {
    const rawData = window.localStorage.getItem(DATA_KEY);
    const rawStyle = window.localStorage.getItem(STYLE_KEY);
    if (!rawData) return null;
    const data = JSON.parse(rawData) as ResumeData;
    const style = rawStyle ? (JSON.parse(rawStyle) as ResumeStyle) : defaultStyle();
    if (!data || typeof data !== "object" || !("personal" in data)) return null;
    return { data, style };
  } catch {
    return null;
  }
}

/**
 * Checks whether a localStorage resume has already been migrated.
 */
export function hasMigratedLocalResume(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(MIGRATION_FLAG) === "true";
  } catch {
    return true;
  }
}

/**
 * Safely migrates an existing localStorage resume into Firestore for the
 * authenticated user. Does NOT delete localStorage data on failure.
 *
 * Returns the new resume ID, or null if there was nothing to migrate.
 */
export async function migrateLocalResume(uid: string): Promise<string | null> {
  if (hasMigratedLocalResume()) return null;

  const local = readLocalResume();
  if (!local) {
    // Nothing to migrate — mark as done so we don't re-check every time.
    try {
      window.localStorage.setItem(MIGRATION_FLAG, "true");
    } catch {}
    return null;
  }

  try {
    // Create a new Firestore resume seeded with the local data directly,
    // rather than creating an empty resume and immediately overwriting it.
    const templateId = local.style?.templateId ?? "modern";
    const resume = await createResume(uid, {
      title: local.data.personal.fullName
        ? `${local.data.personal.fullName}'s Resume`
        : "My Resume",
      resumeData: local.data,
      resumeStyle: local.style,
      templateId,
      questionnaireCompleted: true,
      questionnaireVersion: 1,
    });

    // Only mark as migrated AFTER successful Firestore write.
    try {
      window.localStorage.setItem(MIGRATION_FLAG, "true");
    } catch {}

    return resume.id;
  } catch (error) {
    console.error("[migration] Failed to migrate localStorage resume:", error);
    // Do NOT delete localStorage data — keep it for a retry.
    return null;
  }
}