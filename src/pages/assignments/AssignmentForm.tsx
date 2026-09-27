import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { assignmentService } from "#/services/assignment.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import { useMemo, useState } from "react";
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
  onSuccess: () => void;
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
  const [classId, setClassId] = useState<ID>(
    initialData?.classId ?? availableClasses[0]?.id ?? "",
  );
  const [deadline, setDeadline] = useState<string>(
    initialData?.deadline
      ? (new Date(initialData.deadline).toISOString().split("T")[0] ?? "")
      : "",
  );
  const [errors, setErrors] = useState<AssignmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classOptions = useMemo(
    () => [
      { label: "انتخاب کلاس...", value: "", disabled: true },
      ...availableClasses.map((c) => ({ label: c.title, value: c.id })),
    ],
    [availableClasses],
  );
  const handleSubmit = async () => {
    const validationErrors = validateAssignmentForm({
      title,
      deadline,
      classId,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedClass = availableClasses.find((c) => c.id === classId);
      const finalTeacherId = isAdmin
        ? (selectedClass?.teacherId ?? teacherId)
        : teacherId;

      const deadlineDate = new Date(`${deadline}T23:59:59`);
      const deadlineISO = deadlineDate.toISOString();

      const payload = {
        title: title.trim(),
        description: description.trim(),
        classId,
        teacherId: finalTeacherId,
        deadline: deadlineISO,
      };

      if (initialData) {
        await assignmentService.update(initialData.id, payload);
      } else {
        await assignmentService.create(payload);
      }
      onSuccess();
    } catch {
      setErrors({ form: "خطا در ذخیره تکلیف. لطفاً دوباره تلاش کنید." });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined, form: undefined }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const handleClassIdChange = (value: string) => {
    setClassId(value as ID);
    if (errors.classId) {
      setErrors((prev) => ({ ...prev, classId: undefined, form: undefined }));
    }
  };

  const handleDeadlineChange = (value: string) => {
    setDeadline(value);
    if (errors.deadline) {
      setErrors((prev) => ({ ...prev, deadline: undefined, form: undefined }));
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
          label="عنوان"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          error={errors.title}
          placeholder="عنوان تکلیف"
          required
        />

        <Select
          label="کلاس"
          value={classId}
          onChange={(e) => handleClassIdChange(e.target.value)}
          options={classOptions}
          error={errors.classId}
          required
        />

        <Textarea
          label="توضیحات"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={4}
          placeholder="شرح تکلیف..."
        />

        <Input
          label="ددلاین"
          type="date"
          value={deadline}
          onChange={(e) => handleDeadlineChange(e.target.value)}
          error={errors.deadline}
          required
        />
        {errors.form && (
          <p className="text-sm text-red-600" role="alert">
            {errors.form}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
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
