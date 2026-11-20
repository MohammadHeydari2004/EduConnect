import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import {
  ALL_ROLES,
  DEFAULT_TARGET_AUDIENCE,
  GLOBAL_ANNOUNCEMENT_CLASS_ID,
} from "#/configs/constants";
import { useToast } from "#/hooks/useToast.ts";
import { useFieldErrors } from "#/hooks/useFieldErrors.ts";
import { validateAnnouncementForm } from "#/pages/announcements/validators.ts";
import { announcementService } from "#/services/announcement.ts";
import { buildAnnouncementPayload, getAnnouncementClassOptions, isAdmin, validateGlobalAnnouncementRoles } from "#/utils";
import {
  ClassAnnouncementAudience,
  GlobalAnnouncementRoles,
} from "#/components/ui/AnnouncementFormParts";
import type { Announcement, AnnouncementFormErrors, ClassItem, ID, TargetAudience, UserRole } from "#/types";
import { FORM_PLACEHOLDERS } from "#/configs/constants";
import { useEffect, useMemo, useState, type FormEvent } from "react";

interface Props {
  isOpen: boolean;
  initialData?: Announcement | null;
  classes: ClassItem[];
  authorId: ID;
  userRole: UserRole;
  onClose: () => void;
  onSuccess: (announcement: Announcement) => void;
}
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
    initialData?.classId ?? GLOBAL_ANNOUNCEMENT_CLASS_ID,
  );
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(
    initialData?.targetRoles ?? [...ALL_ROLES],
  );
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    initialData?.targetAudience ?? DEFAULT_TARGET_AUDIENCE,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, setErrors, clearError } = useFieldErrors<
    AnnouncementFormErrors & {
      classId?: string;
      audience?: string;
      roles?: string;
    }
  >();
  const isAdminUser = isAdmin(userRole);

  const classOptions = useMemo(
    () => getAnnouncementClassOptions(isAdminUser, classes),
    [isAdminUser, classes],
  );

  useEffect(() => {
    const validValues = new Set(classOptions.map((o) => o.value));
    if (!validValues.has(classId)) {
      setClassId(classOptions[0]?.value ?? GLOBAL_ANNOUNCEMENT_CLASS_ID);
    }
  }, [classOptions, classId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateAnnouncementForm({ title, content });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (
      !classId ||
      (!isAdminUser && classId === GLOBAL_ANNOUNCEMENT_CLASS_ID)
    ) {
      setErrors((prev) => ({ ...prev, classId: "انتخاب کلاس الزامی است." }));
      return;
    }

    if (isAdminUser && classId !== GLOBAL_ANNOUNCEMENT_CLASS_ID && !targetAudience) {
      setErrors((prev) => ({ ...prev, audience: "انتخاب مخاطبان الزامی است." }));
      return;
    }

    const roleError = validateGlobalAnnouncementRoles(isAdminUser, classId, targetRoles);
    if (roleError) {
      setErrors((prev) => ({ ...prev, roles: roleError }));
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildAnnouncementPayload({
        title,
        content,
        classId,
authorId,
        isAdmin: isAdminUser,
        targetRoles,
        targetAudience,
      });

      let result: Announcement;

      if (initialData) {
        await announcementService.update(initialData.id, payload);
        result = await announcementService.resetSeenBy(initialData.id);
      } else {
        result = await announcementService.create(payload);
      }

      addToast("اطلاعیه با موفقیت ذخیره شد.", "success");
      onSuccess(result);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "خطا در ذخیره اطلاعیه.", "error");
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
    clearError("title");
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    clearError("content");
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? "ویرایش اطلاعیه" : "ایجاد اطلاعیه جدید"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="عنوان"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={FORM_PLACEHOLDERS.ANNOUNCEMENT_TITLE}
          required
          error={errors.title}
        />

        <Select
          label="مخاطب (کلاس)"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            clearError("classId");
            clearError("roles");
          }}
          options={classOptions}
          required
          error={errors.classId}
        />

        {isAdminUser && classId === GLOBAL_ANNOUNCEMENT_CLASS_ID && (
          <GlobalAnnouncementRoles
            targetRoles={targetRoles}
            onToggle={(role) => {
              toggleRole(role);
              clearError("roles");
            }}
            error={errors.roles || undefined}
          />
        )}

        {isAdminUser && classId !== GLOBAL_ANNOUNCEMENT_CLASS_ID && (
          <ClassAnnouncementAudience
            targetAudience={targetAudience}
            onChange={(value) => {
              setTargetAudience(value);
              clearError("audience");
            }}
            error={errors.audience || undefined}
          />
        )}

        <Textarea
          label="محتوا"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={5}
          placeholder={FORM_PLACEHOLDERS.ANNOUNCEMENT_CONTENT}
          required
          error={errors.content}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
