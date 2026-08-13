import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { ResumeData, ResumeStyle } from "@/features/resume-builder/types";
import { blankResume, defaultStyle } from "@/features/resume-builder/sample-data";
import { answersToResumeData } from "@/lib/questionnaire-to-resume";

export const QUESTIONNAIRE_VERSION = 1;

export interface QuestionnaireAnswers {
  careerGoal?: string;
  targetRole?: string;
  targetIndustry?: string;
  personal?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  education?: Array<{
    degree: string;
    school: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }>;
  hasExperience?: boolean;
  skills?: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url: string;
    githubUrl: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
  achievements?: string[];
  additional?: {
    languages?: Array<{ name: string; level: string }>;
    volunteer?: string;
    publications?: string;
    extracurricular?: string;
    interests?: string;
  };
}

export interface ResumeDocument {
  id: string;
  uid: string;
  title: string;
  resumeData: ResumeData;
  style: ResumeStyle;
  templateId: string;
  questionnaireCompleted: boolean;
  questionnaireVersion: number;
  questionnaireAnswers?: QuestionnaireAnswers;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

const RESUMES_COLLECTION = "resumes";

function getResumesRef() {
  return collection(getFirebaseDb(), RESUMES_COLLECTION);
}

function getResumeRef(resumeId: string) {
  return doc(getFirebaseDb(), RESUMES_COLLECTION, resumeId);
}

/**
 * Creates a new resume document scoped to the authenticated user.
 * Returns the new resume document with its Firestore ID.
 */
export async function createResume(uid: string, title?: string): Promise<ResumeDocument> {
  const now = serverTimestamp();
  const docRef = await addDoc(getResumesRef(), {
    uid,
    title: title ?? "Untitled Resume",
    resumeData: blankResume(),
    style: defaultStyle(),
    templateId: "modern",
    questionnaireCompleted: false,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    uid,
    title: title ?? "Untitled Resume",
    resumeData: blankResume(),
    style: defaultStyle(),
    templateId: "modern",
    questionnaireCompleted: false,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    createdAt: null,
    updatedAt: null,
  };
}

/**
 * Fetches a single resume by ID. Returns null if not found or not owned by the user.
 */
export async function getResume(resumeId: string, uid: string): Promise<ResumeDocument | null> {
  const snap = await getDoc(getResumeRef(resumeId));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<ResumeDocument, "id">;
  if (data.uid !== uid) return null;
  return { ...data, id: snap.id };
}

/**
 * Updates a resume document. Only the owner can update.
 */
export async function updateResume(
  resumeId: string,
  uid: string,
  patch: Partial<Omit<ResumeDocument, "id" | "uid" | "createdAt">>,
): Promise<void> {
  await updateDoc(getResumeRef(resumeId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a resume document. Only the owner can delete.
 */
export async function deleteResume(resumeId: string, uid: string): Promise<void> {
  await deleteDoc(getResumeRef(resumeId));
}

/**
 * Lists all resumes belonging to the authenticated user, newest first.
 */
export async function getUserResumes(uid: string): Promise<ResumeDocument[]> {
  const q = query(getResumesRef(), where("uid", "==", uid));
  const snap = await getDocs(q);
  const resumes: ResumeDocument[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() as Omit<ResumeDocument, "id">;
    resumes.push({ ...data, id: docSnap.id });
  });
  // Sort by updatedAt descending (newest first)
  resumes.sort((a, b) => {
    const aTime = a.updatedAt?.toMillis?.() ?? 0;
    const bTime = b.updatedAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
  return resumes;
}

/**
 * Marks the questionnaire as completed for a resume, and — critically —
 * converts the collected answers into actual résumé content (`resumeData`).
 * Without this conversion the résumé stays blank even after a full
 * questionnaire is filled in, since the editor/templates only ever read
 * `resumeData`, never `questionnaireAnswers`.
 */
export async function markQuestionnaireCompleted(
  resumeId: string,
  uid: string,
  answers: QuestionnaireAnswers,
): Promise<void> {
  const resumeData = answersToResumeData(answers);
  await updateResume(resumeId, uid, {
    questionnaireCompleted: true,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    questionnaireAnswers: answers,
    resumeData,
  });
}

/**
 * Saves resume data + style to Firestore (debounced by caller).
 */
export async function saveResumeContent(
  resumeId: string,
  uid: string,
  resumeData: ResumeData,
  style: ResumeStyle,
): Promise<void> {
  await updateResume(resumeId, uid, {
    resumeData,
    style,
    templateId: style.templateId,
  });
}

/**
 * Duplicates a resume for the same user.
 */
export async function duplicateResume(
  resumeId: string,
  uid: string,
): Promise<ResumeDocument | null> {
  const original = await getResume(resumeId, uid);
  if (!original) return null;
  const now = serverTimestamp();
  const docRef = await addDoc(getResumesRef(), {
    uid,
    title: `${original.title} (Copy)`,
    resumeData: original.resumeData,
    style: original.style,
    templateId: original.templateId,
    questionnaireCompleted: original.questionnaireCompleted,
    questionnaireVersion: original.questionnaireVersion,
    questionnaireAnswers: original.questionnaireAnswers,
    createdAt: now,
    updatedAt: now,
  });
  return {
    ...original,
    id: docRef.id,
    title: `${original.title} (Copy)`,
    createdAt: null,
    updatedAt: null,
  };
}
