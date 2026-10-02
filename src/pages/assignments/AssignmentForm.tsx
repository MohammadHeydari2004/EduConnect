import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { assignmentService } from "#/services/assignment.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import { useState } from "react";
import {
  validateAssignmentForm,
  type AssignmentFormErrors,
} from "./validators";

interface Props {
  isOpen: boolean;
  initialData?: Assignment | null;
  availableClasses: ClassItem[];
  teacherId: ID;
  isAdmin: boolean;
  onClose: () => void;
  onSuccess: (message: string, assignment: Assignment) => void;
}

export default function AssignmentForm({
  isOpen,
  initialData,
  availableClasses,
  teacherId,
  isAdmin,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [deadline, setDeadline] = useState(
    initialData
      ? (new Date(initialData.deadline).toISOString().split("T")[0] ?? "")
      : "",
  );
  const [classId, setClassId] = useState(initialData?.classId ?? "");
  // اصلاح تایپ: استفاده از AssignmentFormErrors به‌جای Partial<Record<string, string>>
  const [errors, setErrors] = useState<AssignmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classOptions = availableClasses.map((c) => ({
    label: c.title || "(بدون عنوان)",
    value: c.id,
  }));

  const handleSubmit = async () => {
    const validationErrors = validateAssignmentForm({
      title,
      classId,
      deadline,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const selectedClass = availableClasses.find((c) => c.id === classId);
    const finalTeacherId = isAdmin ? selectedClass?.teacherId : teacherId;
    if (!finalTeacherId) return;

    const deadlineDate = new Date(`${deadline}T23:59:59`);

    const payload = {
      title,
      description,
      deadline: deadlineDate.toISOString(),
      classId,
      teacherId: finalTeacherId,
    };

    try {
      setIsSubmitting(true);
      let result: Assignment;
      if (initialData) {
        result = await assignmentService.update(initialData.id, payload);
        onSuccess("تکلیف با موفقیت ویرایش شد.", result);
      } else {
        result = await assignmentService.create(payload);
        onSuccess("تکلیف با موفقیت ایجاد شد.", result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? "ویرایش تکلیف" : "ایجاد تکلیف جدید"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <Input
          label="عنوان تکلیف"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title)
              setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          error={errors.title}
          placeholder="مثلاً: تمرین اول"
          required
        />
        <Select
          label="کلاس"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            if (errors.classId)
              setErrors((prev) => ({ ...prev, classId: undefined }));
          }}
          options={[
            { label: "انتخاب کلاس...", value: "", disabled: true },
            ...classOptions,
          ]}
          error={errors.classId}
          required
        />
        <Input
          label="ددلاین"
          type="date"
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            if (errors.deadline)
              setErrors((prev) => ({ ...prev, deadline: undefined }));
          }}
          error={errors.deadline}
          required
        />
        <Textarea
          label="توضیحات"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات مختصر درباره تکلیف..."
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
