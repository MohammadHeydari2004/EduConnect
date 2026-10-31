import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { useToast } from "#/hooks/useToast.ts";
import {
  validateAssignmentForm,
  type AssignmentFormErrors,
} from "#/pages/assignments/validators.ts";
import { assignmentService } from "#/services/assignment.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { FORM_PLACEHOLDERS } from "#/configs/constants";
import { useState } from "react";

interface Props {
  initialData?: Assignment | null;
  availableClasses: ClassItem[];
  teacherId: ID;
  isAdmin: boolean;
  onClose: () => void;
  onSuccess: (assignment: Assignment) => void;
}

export default function AssignmentForm({
  initialData,
  availableClasses,
  teacherId,
  isAdmin,
  onClose,
  onSuccess,
}: Props) {
  const { addToast } = useToast();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [deadline, setDeadline] = useState(initialData?.deadline?.split("T")[0] ?? "");
  const [classId, setClassId] = useState(initialData?.classId ?? "");
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
      originalDeadline: initialData?.deadline?.split("T")[0] ?? "",
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const selectedClass = availableClasses.find((c) => c.id === classId);
    const finalTeacherId = isAdmin ? selectedClass?.teacherId : teacherId;

    if (!finalTeacherId) {
      setErrors({
        form: "این کلاس فاقد استاد است. ابتدا استاد کلاس را تعیین کنید.",
      });
      return;
    }

    const payload = {
      title,
      description,
      deadline: deadline ? `${deadline}T23:59:59.999Z` : "",
      classId,
      teacherId: finalTeacherId,
    };

    try {
      setIsSubmitting(true);
      let result: Assignment;
      if (initialData) {
        result = await assignmentService.update(initialData.id, payload);
        addToast("تکلیف با موفقیت ویرایش شد.", "success");
      } else {
        result = await assignmentService.create(payload);
        addToast("تکلیف با موفقیت ایجاد شد.", "success");
      }
      onSuccess(result);
    } catch (err) {
      addToast(
        getErrorMessage(err, "خطا در ذخیره تکلیف. لطفاً دوباره تلاش کنید."),
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={initialData ? "ویرایش تکلیف" : "ایجاد تکلیف جدید"}
      onClose={onClose}
    >
      <div className="space-y-4">
        {errors.form && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {errors.form}
          </p>
        )}

        <Input
          label="عنوان تکلیف"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title || errors.form)
              setErrors((prev) => ({
                ...prev,
                title: "",
                form: "",
              }));
          }}
          error={errors.title}
          placeholder={FORM_PLACEHOLDERS.ASSIGNMENT_TITLE}
          required
        />
        <Select
          label="کلاس"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            if (errors.classId || errors.form)
              setErrors((prev) => ({
                ...prev,
                classId: "",
                form: "",
              }));
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
            if (errors.deadline || errors.form)
              setErrors((prev) => ({
                ...prev,
                deadline: "",
                form: "",
              }));
          }}
          error={errors.deadline}
          required
        />
        <Textarea
          label="توضیحات"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={FORM_PLACEHOLDERS.ASSIGNMENT_DESCRIPTION}
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
