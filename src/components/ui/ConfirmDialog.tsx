import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDialog({
  isOpen,
  title = "تأیید عملیات",
  message = "آیا از انجام این عملیات مطمئن هستید؟",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <p className="mb-6 text-sm text-gray-600">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          تأیید
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
