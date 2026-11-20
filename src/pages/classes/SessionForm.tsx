import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { validateSessionForm } from "#/pages/classes/sessionValidation.ts";
import { sessionService } from "#/services/session.ts";
import { useFieldErrors } from "#/hooks/useFieldErrors.ts";
import type { ID, Session, SessionFormErrors, SessionFormValues } from "#/types";
import { useState } from "react";

interface Props {
  classId: ID;
  onClose: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string, session: Session) => void;
  initialData?: Session | null;
}

export default function SessionForm({
  classId,
  onClose,
  onError,
  onSuccess,
  initialData,
}: Props) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<SessionFormValues>(() => ({
    title: initialData?.title ?? "",
    date: initialData?.date ?? "",
    description: initialData?.description ?? "",
    classId,
  }));
  const { errors, setErrors, clearError } = useFieldErrors<SessionFormErrors>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateSessionForm({ ...form, classId });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      let newSession: Session;
      if (initialData) {
        newSession = await sessionService.update(initialData.id, form);
      } else {
        newSession = await sessionService.create({ ...form, classId });
      }
      onSuccess(isEdit ? "جلسه با موفقیت ویرایش شد." : "جلسه با موفقیت ایجاد شد.", newSession);
    } catch (err) {
      onError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? "ویرایش جلسه" : "افزودن جلسه جدید"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="space-y-4"
      >
        <Input
          label="عنوان جلسه"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            clearError("title");
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
            clearError("date");
          }}
          error={errors.date}
          required
        />
        <Textarea
          label="توضیحات"
          value={form.description}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            clearError("description");
          }}
          error={errors.description}
          placeholder="توضیحات مختصر درباره جلسه..."
          rows={3}
        />
        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit">
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
