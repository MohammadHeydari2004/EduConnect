import { WarningIcon } from "#/components/common/icons";
import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  /** Disables both buttons and shows a spinner while the action is running. */
  isLoading?: boolean;
}

function ConfirmDialog({
  isOpen,
  title = "تأیید عملیات",
  message = "آیا از انجام این عملیات مطمئن هستید؟",
  onConfirm,
  onClose,
  confirmText = "تأیید",
  cancelText = "انصراف",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div className="text-center sm:text-right">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 sm:mx-0">
          <WarningIcon className="h-6 w-6 text-red-600" />
        </div>

        <div className="mb-6 text-sm leading-relaxed text-gray-600">
          {message}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          autoFocus
        >
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
