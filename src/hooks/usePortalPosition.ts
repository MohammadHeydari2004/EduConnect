import { useCallback, useEffect, useState } from "react";

interface UsePortalPositionOptions {
  triggerRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLElement | null>;
  defaultWidth?: number;
  defaultHeight?: number;
  viewportPadding?: number;
  openDirection?: "down" | "up";
}

interface Position {
  top: number;
  left: number;
  width: number;
}

export function usePortalPosition({
  triggerRef,
  menuRef,
  defaultWidth = 160,
  defaultHeight = 100,
  viewportPadding = 8,
  openDirection = "down",
}: UsePortalPositionOptions) {
  const [position, setPosition] = useState<Position | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const btnRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = menuRef.current?.offsetWidth || defaultWidth;
    const menuHeight = menuRef.current?.offsetHeight || defaultHeight;

    let left = btnRect.left;
    if (left + menuWidth > viewportWidth - viewportPadding) {
      left = btnRect.right - menuWidth;
    }
    if (left < viewportPadding) {
      left = viewportPadding;
    }

    let top: number;
    if (openDirection === "up") {
      top = btnRect.top - menuHeight - viewportPadding;
      if (top < viewportPadding) {
        top = btnRect.bottom + viewportPadding;
      }
    } else {
      top = btnRect.bottom + viewportPadding;
      if (top + menuHeight > viewportHeight - viewportPadding) {
        top = btnRect.top - menuHeight - viewportPadding;
      }
    }

    setPosition({ top, left, width: menuWidth });
  }, [triggerRef, menuRef, defaultWidth, defaultHeight, viewportPadding, openDirection]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition, true);
    };
  }, [updatePosition]);

  return position ?? { top: -9999, left: -9999, width: defaultWidth };
}
