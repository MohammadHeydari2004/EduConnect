import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "#/components/common/icons";

interface ModalProps {
  /**
   * Whether the modal is open. Defaults to `true` when the parent
   * conditionally renders the modal (i.e. only mounts it when open).
   */
  isOpen?: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  ariaLabel?: string;
}

function Modal({ isOpen = true, title, children, onClose, ariaLabel }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Queried on demand (on every Tab keypress) instead of being cached once
  // on open, so focusable elements that appear inside the modal later
  // (conditional renders after the first paint) stay inside the trap.
  const getFocusableElements = (): HTMLElement[] => {
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
    ).filter((el) => el.offsetParent !== null);
  };

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={!title ? (ariaLabel ?? "پنجره گفتگو") : undefined}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 outline-none sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg sm:p-6">
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
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
