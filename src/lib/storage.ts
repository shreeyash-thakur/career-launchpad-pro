import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

/**
 * Uploads a file to Firebase Storage under `avatars/{uid}/{filename}` and
 * returns its public download URL. Intended for profile-photo uploads, but
 * works for any single-file upload keyed to a user.
 */
export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const storage = getFirebaseStorage();
  const path = `avatars/${uid}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/**
 * Generic helper for uploading any user-scoped file, e.g. exported resume
 * PDFs: uploadUserFile(uid, "resumes/my-resume.pdf", blob).
 */
export async function uploadUserFile(
  uid: string,
  relativePath: string,
  file: File | Blob,
): Promise<string> {
  const storage = getFirebaseStorage();
  const fileRef = ref(storage, `users/${uid}/${relativePath}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
