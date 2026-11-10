import { WarningIcon } from "#/components/common/icons";
import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import { DIALOG_STRINGS } from "#/configs/constants/formStrings.ts";
import type { ReactNode } from "react";

export type ConfirmTone = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  tone?: ConfirmTone;
}

const TONE_CLASSES: Record<
  ConfirmTone,
  {
    bg: string;
    text: string;
    buttonVariant: "danger" | "primary" | "secondary";
  }
> = {
  danger: {
    bg: "bg-red-100",
    text: "text-red-600",
    buttonVariant: "danger",
  },
  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    buttonVariant: "primary",
  },
  info: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    buttonVariant: "primary",
  },
};

function ConfirmDialog({
  isOpen,
  title = DIALOG_STRINGS.CONFIRM_TITLE,
  message = DIALOG_STRINGS.CONFIRM_MESSAGE,
  onConfirm,
  onClose,
  confirmText = DIALOG_STRINGS.CONFIRM_TEXT,
  cancelText = DIALOG_STRINGS.CANCEL_TEXT,
  isLoading = false,
  tone,
}: ConfirmDialogProps) {
  const effectiveTone: ConfirmTone = tone ?? "danger";
  const toneClasses = TONE_CLASSES[effectiveTone];

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div className="text-center sm:text-right flex flex-col items-center justify-center">
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${toneClasses.bg} sm:mx-0`}
        >
          <WarningIcon className={`h-6 w-6 ${toneClasses.text}`} />
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
          variant={toneClasses.buttonVariant}
          onClick={onConfirm}
          isLoading={isLoading}
          autoFocus
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
