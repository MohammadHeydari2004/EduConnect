import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from "react";

interface UseAsyncDataOptions<T> {
  fetcher: (signal: AbortSignal) => Promise<T>;
  deps: DependencyList;
  fallbackError: string;
}

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refresh: () => void;
}

export function useAsyncData<T>({
  fetcher,
  deps,
  fallbackError,
}: UseAsyncDataOptions<T>): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const fallbackRef = useRef(fallbackError);
  fallbackRef.current = fallbackError;

  const dataRef = useRef<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevDepsRef = useRef<DependencyList>(deps);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    let ignore = false;

    const depsChanged =
      prevDepsRef.current.length !== deps.length ||
      deps.some((dep, index) => dep !== prevDepsRef.current[index]);
    prevDepsRef.current = deps;

    if (depsChanged) {
      setData(null);
      dataRef.current = null;
      setLoading(true);
      setError("");
    } else {
      const hasData = dataRef.current !== null;
      setLoading(!hasData);
      setError("");
    }

    fetcherRef
      .current(signal)
      .then((result) => {
        if (ignore || signal.aborted) return;
        dataRef.current = result;
        setData(result);
        setError("");
      })
      .catch((err: unknown) => {
        if (ignore || signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : fallbackRef.current);
      })
      .finally(() => {
        if (!ignore && !signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [refreshKey, ...deps]);

  return { data, loading, error, refresh };
}