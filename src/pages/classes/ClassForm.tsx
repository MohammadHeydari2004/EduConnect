import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import SearchableMultiSelect from "#/components/ui/SearchableMultiSelect.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { DEFAULT_CLASS_CAPACITY } from "#/configs/constants";
import { useFieldErrors } from "#/hooks/useFieldErrors.ts";
import { validateClassForm } from "#/pages/classes/classValidation.ts";
import { classService } from "#/services/class.ts";
import { removeStudentsFromClassCascade } from "#/services/cascadeDelete.ts";
import type {
  ClassFormErrors,
  ClassFormValues,
  ClassItem,
  User,
} from "#/types";
import { useCallback, useMemo, useState } from "react";
import { selectValue } from "#/utils";

interface Props {
  users: User[];
  initialData?: ClassItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ClassForm({
  users,
  initialData,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const teachers = useMemo(
    () => users.filter((u) => u.role === "teacher" && u.status === "active"),
    [users],
  );
  const students = useMemo(
    () => users.filter((u) => u.role === "student" && u.status === "active"),
    [users],
  );

  const studentOptions = useMemo(
    () => students.map((s) => ({ id: s.id, label: s.name, subLabel: s.email })),
    [students],
  );

  const buildInitialForm = useCallback((): ClassFormValues => ({
    title: initialData?.title || "",
    teacherId: initialData?.teacherId ?? null,
    studentIds: initialData?.studentIds || [],
    capacity: initialData?.capacity || DEFAULT_CLASS_CAPACITY,
    status: initialData?.status || "active",
    description: initialData?.description || "",
  }), [initialData]);

  const [form, setForm] = useState<ClassFormValues>(buildInitialForm);
  const { errors, setErrors, clearError } = useFieldErrors<ClassFormErrors>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateClassForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      if (initialData) {
        const currentStudentIds = new Set(form.studentIds);

        const removedStudentIds = initialData.studentIds.filter(
          (id) => !currentStudentIds.has(id),
        );

        if (removedStudentIds.length > 0) {
          const report = await removeStudentsFromClassCascade(
            initialData.id,
            removedStudentIds,
          );
          if (!report.overallSuccess) {
            onError(
              report.results.flatMap((r) => r.errors).join("؛ ") ||
                "حذف وابستگی‌های دانش‌آموزان با خطا مواجه شد.",
            );
            return;
          }
        }

        await classService.update(initialData.id, form);
        onSuccess("کلاس با موفقیت ویرایش شد.");
      } else {
        await classService.create(form);
        onSuccess("کلاس با موفقیت ایجاد شد.");
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "عملیات با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = initialData ? "ویرایش کلاس" : "ایجاد کلاس جدید";

  return (
    <Modal title={title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="space-y-4"
      >
        <Input
          label="عنوان کلاس"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            clearError("title");
          }}
          error={errors.title}
          placeholder="مثلاً: مبانی برنامه‌نویسی"
          required
        />
        <Select
          label="استاد"
          value={form.teacherId ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, teacherId: value || null });
            clearError("teacherId");
          }}
          options={[
            { label: "انتخاب استاد...", value: "", disabled: true },
            ...teachers.map((t) => ({ label: t.name, value: t.id })),
          ]}
          error={errors.teacherId}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="ظرفیت"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, capacity: value === "" ? 0 : Number(value) });
              clearError("capacity");
            }}
            error={errors.capacity}
            required
          />
          <Select
            label="وضعیت"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: selectValue(
                  e.target.value,
                  ["active", "inactive"],
                  "active",
                ),
              })
            }
            options={[
              { label: "فعال", value: "active" },
              { label: "غیرفعال", value: "inactive" },
            ]}
            required
          />
        </div>
        <Textarea
          label="توضیحات"
          value={form.description || ""}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            clearError("description");
          }}
          error={errors.description}
          placeholder="توضیحات مختصر درباره کلاس..."
          rows={3}
        />

        {students.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            دانشجویی در سیستم ثبت نشده است. ابتدا کاربران دانشجو ایجاد کنید.
          </div>
        ) : (
          <SearchableMultiSelect
            label="دانشجویان"
            options={studentOptions}
            selectedIds={form.studentIds}
            onChange={(ids) => {
              setForm({ ...form, studentIds: ids });
              clearError("studentIds");
            }}
            placeholder="دانشجویان را جستجو و انتخاب کنید..."
            searchPlaceholder="جستجوی دانشجو (نام یا ایمیل)..."
            error={errors.studentIds}
          />
        )}

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
