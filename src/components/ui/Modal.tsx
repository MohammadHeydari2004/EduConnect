import { useLockBodyScroll } from "#/hooks/useLockBodyScroll.ts";
import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "#/components/common/icons";

interface ModalProps {
  isOpen?: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  ariaLabel?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  dismissOnBackdropClick?: boolean;
  ariaDescribedBy?: string | undefined;
}

function Modal({
  isOpen = true,
  title,
  children,
  onClose,
  ariaLabel,
  description,
  size = "md",
  dismissOnBackdropClick = true,
  ariaDescribedBy,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descId = useId();

  useLockBodyScroll(isOpen);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!modalRef.current) return [];
    const focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        focusableSelectors.join(", "),
      ),
    ).filter((el) => {
      if (el.closest('[inert="true"], [inert]')) return false;
      const rects = el.getClientRects();
      if (rects.length === 0) return false;
      const style = window.getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") return false;
      const rect = rects[0];
      if (!rect) return false;
      return rect.width > 0 && rect.height > 0;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        const activeElement = document.activeElement as HTMLElement;

        if (e.shiftKey) {
          if (
            activeElement === firstElement ||
            activeElement === modalRef.current
          ) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            activeElement === lastElement ||
            activeElement === modalRef.current
          ) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen, getFocusableElements]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={!title ? (ariaLabel ?? "پنجره گفتگو") : undefined}
      aria-describedby={ariaDescribedBy ?? (description ? descId : undefined)}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 outline-none sm:p-4"
      onClick={dismissOnBackdropClick ? onClose : undefined}
    >
      <div className={`w-full ${sizeClasses[size]} rounded-xl bg-white p-4 shadow-lg sm:p-6`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2
              id={titleId}
              className="text-base font-semibold text-gray-800 sm:text-lg"
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="بستن"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {description && (
          <p id={descId} className="mb-4 text-sm text-gray-600">
            {description}
          </p>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
