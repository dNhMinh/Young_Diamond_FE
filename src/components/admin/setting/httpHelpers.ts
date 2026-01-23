// src/components/admin/setting/httpHelpers.ts
type HttpErrorLike = {
  response?: {
    status?: number;
    data?: unknown;
  };
};

export function isHttpErrorLike(e: unknown): e is HttpErrorLike {
  return typeof e === "object" && e !== null && "response" in e;
}

function hasMessage(x: unknown): x is { message?: unknown } {
  return typeof x === "object" && x !== null && "message" in x;
}

export function getErrorMessage(e: unknown, fallback: string) {
  if (!isHttpErrorLike(e)) return fallback;
  const data = e.response?.data;
  if (hasMessage(data) && typeof data.message === "string") return data.message;
  return fallback;
}
