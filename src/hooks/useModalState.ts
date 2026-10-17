import { useCallback, useState } from "react";

/**
 * Consolidates the "one open dialog at a time" state that pages spread across
 * several booleans (`isCreateOpen`, `isEditOpen`, `isDeleteConfirmOpen`, ...)
 * plus a shared `selected*` target.
 *
 * A single `{ kind, target }` state replaces all of those. Pages that keep two
 * independent modals open at once can call this hook more than once.
 *
 * `open(kind)` keeps the current target (after `close` it is null, so a new
 * dialog has no stale target). Use `openWithTarget(kind, target)` to open a
 * dialog together with its target in one step, and `close` to reset both.
 */
export function useModalState<Target = unknown>() {
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
