import { getErrorMessage } from "#/utils/error.ts";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
  type Dispatch,
  type SetStateAction,
} from "react";

function isPrimitive(value: unknown): boolean {
  return (
    value === null ||
    (typeof value !== "object" && typeof value !== "function")
  );
}

function validateDeps(deps: DependencyList): void {
  if (import.meta.env.DEV) {
    for (const dep of deps) {
      if (!isPrimitive(dep)) {
        console.warn(
          "[useAsyncData] Dependency array contains non-primitive value. This may cause infinite refetches. Use primitive values (string, number, boolean) or stable references only.",
          dep,
        );
      }
    }
  }
}

interface UseAsyncDataOptions<T> {
  fetcher: () => Promise<T>;
  deps: DependencyList;
  fallbackError: string;
}

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string;
  refresh: () => void;
  setData: Dispatch<SetStateAction<T | null>>;
}

export function useAsyncData<T>({
  fetcher,
  deps,
  fallbackError,
}: UseAsyncDataOptions<T>): UseAsyncDataResult<T> {
  validateDeps(deps);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const fallbackRef = useRef(fallbackError);
  fallbackRef.current = fallbackError;

  const dataRef = useRef<T | null>(null);

  const setDataOptimistic = useCallback<Dispatch<SetStateAction<T | null>>>(
    (action) => {
      setData((prev) => {
        const next =
          typeof action === "function"
            ? (action as (value: T | null) => T | null)(prev)
            : action;
        dataRef.current = next;
        return next;
      });
    },
    [],
  );

  const refresh = useCallback(() => {
    setIsRefreshing(dataRef.current !== null);
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    const hasData = dataRef.current !== null;
    setLoading(!hasData);
    setIsRefreshing(hasData);
    setError("");

    fetcherRef
      .current()
      .then((result) => {
        if (ignore) return;
        dataRef.current = result;
        setData(result);
        setError("");
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(getErrorMessage(err, fallbackRef.current));
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey, ...deps]);

  return { data, loading, isRefreshing, error, refresh, setData: setDataOptimistic };
}
