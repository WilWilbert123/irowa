// src/lib/utils/error-handler.ts

export function parseErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
    if ("error" in error && typeof (error as any).error === "string") {
      return (error as any).error;
    }
  }
  return "An unexpected error occurred. Please try again.";
}
