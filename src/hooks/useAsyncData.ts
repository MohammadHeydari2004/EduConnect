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

interface UseAsyncDataOptions<T> {
  /** Performs the fetch. The latest reference is always used on re-runs. */
  fetcher: () => Promise<T>;
  /**
   * Values the fetch depends on. Changing any of them (by value) re-runs the
   * fetch, e.g. the id of the currently logged-in user.
   */
  deps: DependencyList;
  /** Fallback message when the fetch rejects with a non-ApiError. */
  fallbackError: string;
}

interface UseAsyncDataResult<T> {
  data: T | null;
  /** True only while the first load has no data yet. */
  loading: boolean;
  /** True on background refetches that keep the existing data visible. */
  isRefreshing: boolean;
  error: string;
  /** Refetches while keeping existing data/error until the call settles. */
  refresh: () => void;
  /** Optimistically replace/patch the loaded data without a refetch. */
  setData: Dispatch<SetStateAction<T | null>>;
}

/**
 * Replaces the repeated `loading/error/data + useEffect + ignore-flag` pattern.
 * The fetcher is kept in a ref so its identity changing every render does not
 * re-trigger the effect; only `deps` and `refreshKey` do.
 *
 * Note: `isRefreshing` is exposed for callers that want to show a subtle
 * indicator during background refetches. Pages that replace the entire list
 * on error should check `isRefreshing` before showing the error state.
 */
export function useAsyncData<T>({
  fetcher,
  deps,
  fallbackError,
}: UseAsyncDataOptions<T>): UseAsyncDataResult<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const fallbackRef = useRef(fallbackError);
  fallbackRef.current = fallbackError;

  const dataRef = useRef<T | null>(null);

  const setData = useCallback<Dispatch<SetStateAction<T | null>>>(
    (action) => {
      setDataState((prev) => {
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
        setDataState(result);
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
    // `deps` is spread into the effect so value changes re-trigger the
    // fetch; the fetcher stays in a ref on purpose.
    // NOTE: `deps` should only contain primitive values (string, number, boolean)
    // or stable references to avoid unnecessary re-fetches. Object/array deps
    // would cause re-fetches on every render due to referential inequality.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, ...deps]);

  return { data, loading, isRefreshing, error, refresh, setData };
}
