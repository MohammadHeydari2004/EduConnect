import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { useToast } from "#/hooks/useToast.ts";
import { announcementService } from "#/services/announcement.ts";
import type { Announcement, TargetAudience } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID, UserRole } from "#/types/common.ts";
import { useMemo, useState } from "react";
import { validateAnnouncementForm } from "./validators";

interface Props {
  isOpen: boolean;
  initialData?: Announcement | null;
  classes: ClassItem[];
  authorId: ID;
  userRole: UserRole;
  onClose: () => void;
  onSuccess: () => void;
}

type AnnouncementPayload = Omit<
  Partial<Announcement>,
  "targetRoles" | "targetAudience"
> & {
  targetRoles?: UserRole[] | null;
  targetAudience?: TargetAudience | null;
};

export default function AnnouncementForm({
  isOpen,
  initialData,
  classes,
  authorId,
  userRole,
  onClose,
  onSuccess,
}: Props) {
  const { addToast } = useToast();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [classId, setClassId] = useState<string>(
    initialData?.classId?.toString() ?? "0",
  );
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(
    initialData?.targetRoles ?? ["admin", "teacher", "student"],
  );
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    initialData?.targetAudience ?? "students",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = userRole === "admin";

  const classOptions = useMemo(
    () =>
      isAdmin
        ? [
            { label: "همه (عمومی)", value: "0" },
            ...classes.map((c) => ({ label: c.title, value: c.id })),
          ]
        : classes.map((c) => ({ label: c.title, value: c.id })),
    [isAdmin, classes],
  );

  const handleSubmit = async () => {
    const validationErrors = validateAnnouncementForm({ title, content });
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors.form || "خطا در اعتبارسنجی");
      return;
    }

    try {
      setIsSubmitting(true);
      const basePayload = { title, content, classId, authorId };

      const payload: AnnouncementPayload = isAdmin
        ? classId === "0"
          ? { ...basePayload, targetRoles, targetAudience: null }
          : { ...basePayload, targetAudience, targetRoles: null }
        : {
            ...basePayload,
            targetAudience: "students",
            targetRoles: null,
          };

      if (initialData) {
        await announcementService.update(
          initialData.id,
          payload as Partial<Announcement>,
        );
        await announcementService.resetSeenBy(initialData.id);
      } else {
        await announcementService.create(
          payload as Omit<Announcement, "id" | "createdAt" | "seenBy">,
        );
      }

      addToast("اطلاعیه با موفقیت ذخیره شد.", "success");
      onSuccess();
    } catch {
      addToast("خطا در ذخیره اطلاعیه.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRole = (role: UserRole) => {
    setTargetRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (error) setError("");
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    if (error) setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? "ویرایش اطلاعیه" : "ایجاد اطلاعیه جدید"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <Input
          label="عنوان"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="عنوان اطلاعیه"
          required
        />

        <Select
          label="مخاطب (کلاس)"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          options={classOptions}
          required
        />

        {isAdmin && classId === "0" && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">
              قابل مشاهده برای (نقش‌ها):
            </legend>
            <div className="flex flex-wrap gap-3">
              {(["admin", "teacher", "student"] as UserRole[]).map((role) => (
                <label
                  key={role}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={targetRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {role === "admin"
                      ? "مدیر"
                      : role === "teacher"
                        ? "استاد"
                        : "دانشجو"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {isAdmin && classId !== "0" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              مخاطبان در کلاس:
            </label>
            <Select
              value={targetAudience}
              onChange={(e) =>
                setTargetAudience(e.target.value as TargetAudience)
              }
              options={[
                { label: "دانشجویان کلاس", value: "students" },
                { label: "استاد کلاس", value: "teacher" },
                { label: "دانشجویان و استاد کلاس", value: "both" },
              ]}
            />
          </div>
        )}

        <Textarea
          label="محتوا"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={5}
          placeholder="متن اطلاعیه..."
          required
        />

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
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
