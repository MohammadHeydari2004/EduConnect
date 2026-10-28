import { useEffect, useRef, type RefObject } from "react";

export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  onOutside: () => void,
  active: boolean = true,
): void {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const callbackRef = useRef(onOutside);
  callbackRef.current = onOutside;

  useEffect(() => {
    if (!active) return;

    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const contained = refsRef.current.some(
        (ref) => ref.current && ref.current.contains(target),
      );
      if (!contained) callbackRef.current();
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [active]);
}
