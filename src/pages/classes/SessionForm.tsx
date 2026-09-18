import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { sessionService } from "#/services/session.ts";
import type { ID } from "#/types/common.ts";
import { useState } from "react";
import { validateSessionForm, type SessionFormErrors } from "./validators";

interface Props {
  classId: ID;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function SessionForm({
  classId,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<SessionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateSessionForm({
      title,
      date,
      description,
      classId,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await sessionService.create({
        title: title.trim(),
        date,
        description: description.trim(),
        classId,
      });
      onSuccess("جلسه با موفقیت ایجاد شد.");
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "ایجاد جلسه با خطا مواجه شد.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} title="ایجاد جلسه جدید" onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="عنوان جلسه"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
          error={errors.title}
          placeholder="مثلاً: جلسه اول - مقدمه"
        />
        <Input
          label="تاریخ"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) setErrors({ ...errors, date: undefined });
          }}
          error={errors.date}
        />
        <Textarea
          label="توضیحات"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات مختصر درباره محتوای جلسه..."
          rows={3}
        />
        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
