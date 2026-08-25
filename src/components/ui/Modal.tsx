import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
}

function Modal({ isOpen, title, children, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
