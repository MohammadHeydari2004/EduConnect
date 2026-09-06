import { useState } from "react";
import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { classService } from "#/services/modules/classService.ts";
import type { ClassFormValues, ClassItem, ClassStatus } from "#/types/class.ts";
import type { User } from "#/types/user.ts";

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
  const teachers = users.filter(
    (u) => u.role === "teacher" && u.status === "active",
  );
  const students = users.filter(
    (u) => u.role === "student" && u.status === "active",
  );

  const [form, setForm] = useState<ClassFormValues>(() => ({
    title: initialData?.title || "",
    teacherId: initialData?.teacherId ?? null,
    studentIds: initialData?.studentIds || [],
    capacity: initialData?.capacity || 10,
    status: initialData?.status || "active",
    description: initialData?.description || "",
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      newErrors.title = "عنوان الزامی است.";
    } else if (form.title.trim().length < 3) {
      newErrors.title = "عنوان باید حداقل 3 کاراکتر باشد.";
    }
    if (!form.teacherId) newErrors.teacherId = "انتخاب استاد الزامی است.";
    if (form.capacity < 1) newErrors.capacity = "ظرفیت باید حداقل 1 باشد.";
    if (form.studentIds.length > form.capacity) {
      newErrors.students = `تعداد دانشجویان (${form.studentIds.length}) بیشتر از ظرفیت (${form.capacity}) است.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      if (initialData) {
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

  const toggleStudent = (id: number | string) => {
    setForm((prev) => {
      const stringIds = prev.studentIds.map(String);
      const stringId = String(id);
      const exists = stringIds.includes(stringId);
      return {
        ...prev,
        studentIds: exists
          ? prev.studentIds.filter((s) => String(s) !== stringId)
          : [...prev.studentIds, id],
      };
    });
    if (errors.students) setErrors((prev) => ({ ...prev, students: "" }));
  };

  const title = initialData ? "ویرایش کلاس" : "ایجاد کلاس جدید";

  return (
    <Modal isOpen={true} title={title} onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="عنوان کلاس"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: "" });
          }}
          error={errors.title}
          placeholder="مثلاً: مبانی برنامه‌نویسی"
        />
        <Select
          label="استاد"
          value={form.teacherId ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, teacherId: value ? Number(value) : null });
            if (errors.teacherId) setErrors({ ...errors, teacherId: "" });
          }}
          options={[
            { label: "انتخاب استاد...", value: "" },
            ...teachers.map((t) => ({ label: t.name, value: String(t.id) })),
          ]}
          error={errors.teacherId}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="ظرفیت"
            type="number"
            value={form.capacity}
            onChange={(e) => {
              setForm({ ...form, capacity: Number(e.target.value) });
              if (errors.capacity) setErrors({ ...errors, capacity: "" });
            }}
            error={errors.capacity}
          />
          <Select
            label="وضعیت"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as ClassStatus })
            }
            options={[
              { label: "فعال", value: "active" },
              { label: "غیرفعال", value: "inactive" },
            ]}
          />
        </div>
        <Textarea
          label="توضیحات"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="توضیحات مختصر درباره کلاس..."
          rows={3}
        />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              دانشجویان ({form.studentIds.length} انتخاب شده)
            </label>
            {errors.students && (
              <span className="text-xs text-red-600">{errors.students}</span>
            )}
          </div>
          {students.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
              دانشجویی در سیستم ثبت نشده است. ابتدا کاربران دانشجو ایجاد کنید.
            </div>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
              {students.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={form.studentIds.map(String).includes(String(s.id))}
                    onChange={() => toggleStudent(s.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-800">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
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
