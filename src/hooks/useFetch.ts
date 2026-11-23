import { useState, useEffect, useCallback } from "react";
import { errMessage } from "@/lib/errors";

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): UseFetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchFn()
      .then((res) => {
        if (!active) return;
        setState({ data: res, loading: false, error: null });
      })
      .catch((err) => {
        if (!active) return;
        console.warn("useFetch error:", err);
        setState({ data: null, loading: false, error: errMessage(err, "Có lỗi xảy ra") });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { ...state, refetch };
}
