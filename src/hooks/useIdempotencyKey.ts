import { useRef, useCallback } from "react";

export function useIdempotencyKey() {
  const ref = useRef<{ key: string; fingerprint: string } | null>(null);

  const getKey = useCallback((payload: unknown): string => {
    const fingeprint = JSON.stringify(payload);
    if (!ref.current || ref.current.fingerprint != fingeprint) {
      ref.current = { key: crypto.randomUUID(), fingerprint: fingeprint };
    }
    return ref.current.key;
  }, []);

  const resetKey = useCallback(() => {
    ref.current = null;
  }, []);

  return { getKey, resetKey };
}
