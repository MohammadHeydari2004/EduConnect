import Button from "#/components/ui/Button.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { useToast } from "#/hooks/useToast.ts";
import { validateAssignmentForm } from "#/pages/assignments/validators.ts";
import type { Assignment, AssignmentFormErrors, ClassItem, ID } from "#/types";
import { assignmentService } from "#/services/assignment.ts";
import { showErrorToast } from "#/hooks/useToastHelpers.ts";
import { FORM_PLACEHOLDERS } from "#/configs/constants";
import { useCallback, useMemo, useState } from "react";

interface Props {
  initialData?: Assignment | null;
  availableClasses: ClassItem[];
  teacherId: ID;
  onClose: () => void;
  onSuccess: (assignment: Assignment) => void;
}

export default function AssignmentForm({
  initialData,
  availableClasses,
  teacherId,
  onClose,
  onSuccess,
}: Props) {
  const { addToast } = useToast();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [deadline, setDeadline] = useState(
    initialData?.deadline?.split("T")[0] ?? "",
  );
  const [classId, setClassId] = useState(initialData?.classId ?? "");
  const [errors, setErrors] = useState<AssignmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classOptions = useMemo(
    () => availableClasses.map((c) => ({
      label: c.title || "(بدون عنوان)",
      value: c.id,
    })),
    [availableClasses],
  );

  const clearFieldError = useCallback(
    (field: "title" | "classId" | "deadline") => {
      setErrors((prev) => {
        if (!prev[field] && !prev.form) return prev;
        return { ...prev, [field]: "", form: "" };
      });
    },
    [],
  );

  const handleSubmit = async () => {
    const validationErrors = validateAssignmentForm({
      title,
      classId,
      deadline,
      originalDeadline: initialData?.deadline?.split("T")[0] ?? "",
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payloadDeadline = deadline ? `${deadline}T23:59:59.999` : "";

    const payload = {
      title,
      description,
      deadline: payloadDeadline,
      classId,
      teacherId,
    };
    const updatePayload = {
      title,
      description,
      deadline: payloadDeadline,
      classId,
    };

    try {
      setIsSubmitting(true);
      let result: Assignment;
      if (initialData) {
        result = await assignmentService.update(initialData.id, updatePayload);
        addToast("تکلیف با موفقیت ویرایش شد.", "success");
      } else {
        result = await assignmentService.create(payload);
        addToast("تکلیف با موفقیت ایجاد شد.", "success");
      }
      onSuccess(result);
    } catch (err) {
      showErrorToast(
        addToast,
        err instanceof Error ? err.message : "خطا در ذخیره تکلیف. لطفاً دوباره تلاش کنید.",
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="space-y-4"
      >
        {errors.form && <ErrorAlert message={errors.form} />}

        <Input
          label="عنوان تکلیف"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearFieldError("title");
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
            clearFieldError("classId");
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
            clearFieldError("deadline");
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
          <Button type="submit">
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
