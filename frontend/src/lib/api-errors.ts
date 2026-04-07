/** Normalize API error payloads (including Zod flatten()) to a user-facing string. */
export function normalizeApiError(error: unknown, fallback = "Request failed"): string {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return fallback;

  const maybe = error as {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
    message?: string;
  };

  if (typeof maybe.message === "string" && maybe.message.trim()) {
    return maybe.message;
  }
  if (Array.isArray(maybe.formErrors) && maybe.formErrors.length > 0) {
    return maybe.formErrors[0] ?? fallback;
  }
  if (maybe.fieldErrors && typeof maybe.fieldErrors === "object") {
    for (const value of Object.values(maybe.fieldErrors)) {
      if (Array.isArray(value) && value.length > 0) {
        return value[0] ?? fallback;
      }
    }
  }
  return fallback;
}
