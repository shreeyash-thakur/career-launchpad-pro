import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Removes keys whose value is `undefined` from an object.
 *
 * With `exactOptionalPropertyTypes: true`, TypeScript treats `{ foo?: string }`
 * and `{ foo: string | undefined }` as different types — an object literal
 * that explicitly sets a key to `undefined` doesn't satisfy an optional
 * property type. Route `validateSearch` functions and similar call sites
 * build search/param objects from `string | undefined` values, so this
 * keeps that pattern concise instead of writing conditional spreads by hand
 * at every call site.
 */
export function stripUndefined<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  const result: { [K in keyof T]?: Exclude<T[K], undefined> } = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = value as Exclude<T[typeof key], undefined>;
    }
  }
  return result;
}