import { useClickOutside } from "#/hooks/useClickOutside.ts";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreIcon } from "#/components/common/icons";

const MENU_DEFAULT_WIDTH = 160;
const MENU_DEFAULT_HEIGHT = 100;

interface ActionsMenuProps {
  children: ReactNode;
  /** Short label of the row/item the actions belong to, for the trigger's accessible name. */
  label?: string;
}

function ActionsMenu({ children, label }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useClickOutside([buttonRef, menuRef], () => setIsOpen(false), isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;

      const btnRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;

      const menuWidth = menuRef.current?.offsetWidth || MENU_DEFAULT_WIDTH;
      const menuHeight = menuRef.current?.offsetHeight || MENU_DEFAULT_HEIGHT;

      let left = btnRect.left;

      if (left + menuWidth > viewportWidth - 8) {
        left = btnRect.right - menuWidth;
      }

      if (left < 8) {
        left = 8;
      }

      let top = btnRect.bottom + 4;

      if (top + menuHeight > viewportHeight - 8) {
        top = btnRect.top - menuHeight - 4;
      }

      setCoords({ top, left });
    };

    const rafId = requestAnimationFrame(updatePosition);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: btnRect.bottom + 4,
        left: btnRect.left,
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        aria-label={label ? `عملیات روی ${label}` : "عملیات"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreIcon className="h-5 w-5" />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 flex min-w-40 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}

export default ActionsMenu;