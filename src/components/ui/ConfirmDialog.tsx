import { WarningIcon } from "#/components/common/icons";
import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import { DIALOG_STRINGS } from "#/configs/constants";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

function ConfirmDialog({
  isOpen,
  title = DIALOG_STRINGS.CONFIRM_TITLE,
  message = DIALOG_STRINGS.CONFIRM_MESSAGE,
  onConfirm,
  onClose,
  confirmText = DIALOG_STRINGS.CONFIRM_TEXT,
  cancelText = DIALOG_STRINGS.CANCEL_TEXT,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div className="text-center sm:text-right flex flex-col items-center justify-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 sm:mx-0">
          <WarningIcon className="h-6 w-6 text-red-600" />
        </div>

        <div className="mb-6 text-sm leading-relaxed text-gray-600">
          {message}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
