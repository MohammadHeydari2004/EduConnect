import { MenuCloseContext } from "#/hooks/useMenuPropagation.ts";
import { usePortalPosition } from "#/hooks/usePortalPosition.ts";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreIcon } from "#/components/common/icons";
import { useClickOutside } from "#/hooks/useClickOutside.ts";

interface ActionsMenuProps {
  children: ReactNode;
  label?: string | undefined;
}

function getMenuItems(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])"),
  );
}

function ActionsMenu({ children, label }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const closeMenu = useCallback((returnFocus = false) => {
    setIsOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useClickOutside([buttonRef, menuRef], () => closeMenu(), isOpen);

  const position = usePortalPosition({
    triggerRef: buttonRef,
    menuRef: menuRef,
    defaultWidth: 160,
    defaultHeight: 100,
    viewportPadding: 8,
    openDirection: "down",
  });

  useEffect(() => {
    if (!isOpen) return;
    const menuEl = menuRef.current;
    if (!menuEl) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu(true);
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      if (!menuRef.current) return;
      const focusable = getMenuItems(menuRef.current);
      if (focusable.length === 0) return;
      const currentIdx = focusable.indexOf(document.activeElement as HTMLElement);
      let nextIdx: number;
      if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = focusable.length - 1;
      } else {
        const delta = e.key === "ArrowDown" ? 1 : -1;
        nextIdx =
          currentIdx === -1
            ? delta === 1
              ? 0
              : focusable.length - 1
            : (currentIdx + delta + focusable.length) % focusable.length;
      }
      focusable[nextIdx]?.focus();
    };
    document.addEventListener("keydown", handleKey);
    requestAnimationFrame(() => {
      const items = getMenuItems(menuEl);
      items[0]?.focus();
    });
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, closeMenu]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      if (!isOpen) setIsOpen(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        onKeyDown={onTriggerKeyDown}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        aria-label={label ? `عملیات روی ${label}` : "عملیات"}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
      >
        <MoreIcon className="h-5 w-5" />
      </button>
      {isOpen &&
        createPortal(
          <div
            id={menuId}
            ref={menuRef}
            role="menu"
            className="fixed z-50 flex min-w-40 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <MenuCloseContext.Provider value={() => closeMenu(true)}>
              {children}
            </MenuCloseContext.Provider>
          </div>,
          document.body,
        )}
    </>
  );
}

export default ActionsMenu;
