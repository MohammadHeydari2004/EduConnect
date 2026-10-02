import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { sessionService } from "#/services/session.ts";
import type { ID } from "#/types/common.ts";
import type { Session } from "#/types/session.ts";
import { useState } from "react";
import { validateSessionForm } from "./sessionValidation";

interface Props {
  classId: ID;
  onClose: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string, session: Session) => void;
}

interface SessionFormValues {
  title: string;
  date: string;
  description: string;
}

export default function SessionForm({
  classId,
  onClose,
  onError,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<SessionFormValues>({
    title: "",
    date: "",
    description: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SessionFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateSessionForm({ ...form, classId });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const newSession = await sessionService.create({ ...form, classId });
      onSuccess("جلسه با موفقیت ایجاد شد.", newSession);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "ایجاد جلسه با خطا مواجه شد.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} title="افزودن جلسه جدید" onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="عنوان جلسه"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
          error={errors.title}
          placeholder="مثلاً: جلسه اول"
          required
        />
        <Input
          label="تاریخ"
          type="date"
          value={form.date}
          onChange={(e) => {
            setForm({ ...form, date: e.target.value });
            if (errors.date) setErrors({ ...errors, date: undefined });
          }}
          error={errors.date}
          required
        />
        <Textarea
          label="توضیحات"
          value={form.description}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            if (errors.description)
              setErrors({ ...errors, description: undefined });
          }}
          error={errors.description}
          placeholder="توضیحات مختصر درباره جلسه..."
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
