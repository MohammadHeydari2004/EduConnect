import { useCallback, useState } from "react";

export interface UseModalStateResult<Target = unknown> {
  kind: string | null;
  target: Target | null;
  open: (kind: string) => void;
  openWithTarget: (kind: string, target: Target) => void;
  setTarget: (target: Target | null) => void;
  close: () => void;
  isOpen: (kind: string) => boolean;
}

export function useModalState<Target = unknown>(): UseModalStateResult<Target> {
  const [state, setState] = useState<{
    kind: string | null;
    target: Target | null;
  }>({ kind: null, target: null });

  const open = useCallback(
    (kind: string) => setState((prev) => ({ kind, target: prev.target })),
    [],
  );

  const openWithTarget = useCallback(
    (kind: string, target: Target) => setState({ kind, target }),
    [],
  );

  const setTarget = useCallback((target: Target | null) => {
    setState((prev) => ({ ...prev, target }));
  }, []);

  const close = useCallback(() => setState({ kind: null, target: null }), []);

  const isOpen = useCallback(
    (kind: string) => state.kind === kind,
    [state.kind],
  );

  return {
    kind: state.kind,
    target: state.target,
    open,
    openWithTarget,
    setTarget,
    close,
    isOpen,
  };
}
