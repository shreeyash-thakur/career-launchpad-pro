import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, getFirebaseDb } from "./firebase";
import type { ResumeData, ResumeStyle } from "@/features/resume-builder/types";
import { defaultStyle, sampleResume, blankResume } from "@/features/resume-builder/sample-data";

export interface FirestoreResume {
  id: string;
  uid: string;
  title: string;
  templateId: string;
  resumeData: ResumeData;
  resumeStyle: ResumeStyle;
  questionnaireCompleted: boolean;
  questionnaireVersion: number;
  questionnaireAnswers?: Record<string, string>;
  createdAt: any;
  updatedAt: any;
}

export type ResumeDocument = FirestoreResume;

const LOCAL_RESUMES_KEY = "peasiprofile:resumes:";

function getLocalStorageResumes(uid: string): FirestoreResume[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_RESUMES_KEY + uid);
    if (!raw) return [];
    return JSON.parse(raw) as FirestoreResume[];
  } catch {
    return [];
  }
}

function saveLocalStorageResumes(uid: string, list: FirestoreResume[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_RESUMES_KEY + uid, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save resumes to localStorage cache:", err);
  }
}

export async function listUserResumes(uid: string): Promise<FirestoreResume[]> {
  if (!uid) return [];

  let liveResumes: FirestoreResume[] = [];
  let firestoreFailed = false;

  const firestore = db || getFirebaseDb();
  if (firestore && !firestore.app.options.apiKey?.startsWith("AIzaSyDemo")) {
    try {
      const q = query(collection(firestore, "resumes"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      liveResumes = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          uid: d["uid"] || uid,
          title: d["title"] || "Untitled Resume",
          templateId: d["templateId"] || d["resumeStyle"]?.templateId || "modern",
          resumeData: d["resumeData"] || sampleResume(),
          resumeStyle: d["resumeStyle"] || defaultStyle(),
          questionnaireCompleted: Boolean(d["questionnaireCompleted"]),
          questionnaireVersion: d["questionnaireVersion"] || 1,
          questionnaireAnswers: d["questionnaireAnswers"] || {},
          createdAt: d["createdAt"]?.toMillis ? d["createdAt"].toMillis() : (typeof d["createdAt"] === "number" ? d["createdAt"] : Date.now()),
          updatedAt: d["updatedAt"]?.toMillis ? d["updatedAt"].toMillis() : (typeof d["updatedAt"] === "number" ? d["updatedAt"] : Date.now()),
        };
      });
    } catch (err) {
      console.warn("[Firestore] Failed to list resumes, using local cache:", err);
      firestoreFailed = true;
    }
  } else {
    firestoreFailed = true;
  }

  if (firestoreFailed || liveResumes.length === 0) {
    const cached = getLocalStorageResumes(uid);
    if (cached.length > 0) {
      return cached.sort((a, b) => {
        const timeA = typeof a.updatedAt === "number" ? a.updatedAt : Date.now();
        const timeB = typeof b.updatedAt === "number" ? b.updatedAt : Date.now();
        return timeB - timeA;
      });
    }
  } else {
    saveLocalStorageResumes(uid, liveResumes);
    return liveResumes.sort((a, b) => {
      const timeA = typeof a.updatedAt === "number" ? a.updatedAt : Date.now();
      const timeB = typeof b.updatedAt === "number" ? b.updatedAt : Date.now();
      return timeB - timeA;
    });
  }

  return liveResumes.sort((a, b) => {
    const timeA = typeof a.updatedAt === "number" ? a.updatedAt : Date.now();
    const timeB = typeof b.updatedAt === "number" ? b.updatedAt : Date.now();
    return timeB - timeA;
  });
}

export const getUserResumes = listUserResumes;

export async function getResume(resumeId: string, uid?: string): Promise<FirestoreResume | null> {
  if (!resumeId) return null;

  const firestore = db || getFirebaseDb();
  if (firestore && !firestore.app.options.apiKey?.startsWith("AIzaSyDemo")) {
    try {
      const ref = doc(firestore, "resumes", resumeId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        if (uid && d["uid"] && d["uid"] !== uid) {
          throw new Error("UNAUTHORIZED_RESUME_ACCESS");
        }
        return {
          id: snap.id,
          uid: d["uid"] || uid || "guest",
          title: d["title"] || "Untitled Resume",
          templateId: d["templateId"] || d["resumeStyle"]?.templateId || "modern",
          resumeData: d["resumeData"] || sampleResume(),
          resumeStyle: d["resumeStyle"] || defaultStyle(),
          questionnaireCompleted: Boolean(d["questionnaireCompleted"]),
          questionnaireVersion: d["questionnaireVersion"] || 1,
          questionnaireAnswers: d["questionnaireAnswers"] || {},
          createdAt: d["createdAt"]?.toMillis ? d["createdAt"].toMillis() : (typeof d["createdAt"] === "number" ? d["createdAt"] : Date.now()),
          updatedAt: d["updatedAt"]?.toMillis ? d["updatedAt"].toMillis() : (typeof d["updatedAt"] === "number" ? d["updatedAt"] : Date.now()),
        };
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED_RESUME_ACCESS") {
        throw err;
      }
      console.warn("[Firestore] Get doc fallback to local cache:", err);
    }
  }

  const cachedList = getLocalStorageResumes(uid || "guest");
  const found = cachedList.find((r) => r.id === resumeId);
  if (found) {
    if (uid && found.uid && found.uid !== uid) {
      throw new Error("UNAUTHORIZED_RESUME_ACCESS");
    }
    return found;
  }
  return null;
}

export async function createResume(
  uid: string,
  initial?: Partial<FirestoreResume>,
): Promise<FirestoreResume> {
  const id = "res_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const now = Date.now();
  const style = initial?.resumeStyle || { ...defaultStyle(), templateId: initial?.templateId || "modern" };

  const newResume: FirestoreResume = {
    id,
    uid,
    title: initial?.title || "My Professional Resume",
    templateId: initial?.templateId || style.templateId || "modern",
    resumeData: initial?.resumeData || sampleResume(),
    resumeStyle: style,
    questionnaireCompleted: initial?.questionnaireCompleted ?? false,
    questionnaireVersion: 1,
    questionnaireAnswers: initial?.questionnaireAnswers || {},
    createdAt: now,
    updatedAt: now,
  };

  const firestore = db || getFirebaseDb();
  if (firestore && !firestore.app.options.apiKey?.startsWith("AIzaSyDemo")) {
    try {
      const ref = doc(firestore, "resumes", id);
      await setDoc(ref, {
        ...newResume,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("[Firestore] Create resume fallback to local storage:", err);
    }
  }

  const currentList = getLocalStorageResumes(uid);
  saveLocalStorageResumes(uid, [newResume, ...currentList]);

  return newResume;
}

export async function updateResume(
  resumeId: string,
  uid: string,
  partial: Partial<FirestoreResume>,
): Promise<void> {
  const now = Date.now();

  const firestore = db || getFirebaseDb();
  if (firestore && !firestore.app.options.apiKey?.startsWith("AIzaSyDemo")) {
    try {
      const ref = doc(firestore, "resumes", resumeId);
      await updateDoc(ref, {
        ...partial,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("[Firestore] Update resume fallback to local cache:", err);
    }
  }

  const currentList = getLocalStorageResumes(uid);
  const updated = currentList.map((r) => {
    if (r.id === resumeId) {
      return {
        ...r,
        ...partial,
        updatedAt: now,
      };
    }
    return r;
  });
  saveLocalStorageResumes(uid, updated);
}

export async function saveResumeContent(
  resumeId: string,
  uid: string,
  data: ResumeData,
  style?: ResumeStyle,
): Promise<void> {
  const partial: Partial<FirestoreResume> = { resumeData: data };
  if (style) {
    partial.resumeStyle = style;
    partial.templateId = style.templateId;
  }
  await updateResume(resumeId, uid, partial);
}

export async function markQuestionnaireCompleted(
  resumeId: string,
  uid: string,
  answers: Record<string, string>,
  templateId?: string,
): Promise<void> {
  const partial: Partial<FirestoreResume> = {
    questionnaireCompleted: true,
    questionnaireAnswers: answers,
  };
  if (templateId) {
    partial.templateId = templateId;
  }
  await updateResume(resumeId, uid, partial);
}

export async function renameResume(resumeId: string, uid: string, newTitle: string): Promise<void> {
  await updateResume(resumeId, uid, { title: newTitle.trim() || "Untitled Resume" });
}

export async function duplicateResume(resumeId: string, uid: string): Promise<FirestoreResume> {
  const source = await getResume(resumeId, uid);
  if (!source) {
    throw new Error("Resume not found to duplicate");
  }

  const cloned: Partial<FirestoreResume> = {
    title: `Copy of ${source.title}`,
    templateId: source.templateId,
    resumeData: JSON.parse(JSON.stringify(source.resumeData)),
    resumeStyle: JSON.parse(JSON.stringify(source.resumeStyle)),
    questionnaireCompleted: source.questionnaireCompleted,
    questionnaireAnswers: source.questionnaireAnswers ? { ...source.questionnaireAnswers } : {},
  };

  return await createResume(uid, cloned);
}

export async function deleteResume(resumeId: string, uid: string): Promise<void> {
  const firestore = db || getFirebaseDb();
  if (firestore && !firestore.app.options.apiKey?.startsWith("AIzaSyDemo")) {
    try {
      const ref = doc(firestore, "resumes", resumeId);
      await deleteDoc(ref);
    } catch (err) {
      console.warn("[Firestore] Delete resume fallback to local cache:", err);
    }
  }

  const currentList = getLocalStorageResumes(uid);
  const remaining = currentList.filter((r) => r.id !== resumeId);
  saveLocalStorageResumes(uid, remaining);
}

export const ResumeService = {
  listUserResumes,
  getUserResumes,
  getResume,
  createResume,
  updateResume,
  saveResumeContent,
  markQuestionnaireCompleted,
  renameResume,
  duplicateResume,
  deleteResume,
};
