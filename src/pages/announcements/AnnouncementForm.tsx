import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import {
  ALL_ROLES,
  GLOBAL_ANNOUNCEMENT_CLASS_ID,
} from "#/configs/constants";
import { useToast } from "#/hooks/useToast.ts";
import { validateAnnouncementForm } from "#/pages/announcements/validators.ts";
import { announcementService } from "#/services/announcement.ts";
import {
  buildAnnouncementPayload,
  validateGlobalAnnouncementRoles,
  getAnnouncementClassOptions,
} from "#/utils/announcementPayload";
import { GlobalAnnouncementRoles } from "#/components/ui/AnnouncementFormParts";
import { ClassAnnouncementAudience } from "#/components/ui/AnnouncementFormParts";
import type { Announcement, TargetAudience } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID, UserRole } from "#/types/common.ts";
import { getErrorMessage } from "#/services/error.ts";
import { FORM_PLACEHOLDERS } from "#/configs/constants";
import { useEffect, useMemo, useState } from "react";

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
    initialData?.targetRoles ?? ALL_ROLES,
  );
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    initialData?.targetAudience ?? "students",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [classError, setClassError] = useState("");
  const [audienceError, setAudienceError] = useState("");
  const [rolesError, setRolesError] = useState("");
  const isAdmin = userRole === "admin";

  const classOptions = useMemo(
    () => getAnnouncementClassOptions(isAdmin, classes),
    [isAdmin, classes],
  );

  useEffect(() => {
    const validValues = new Set(classOptions.map((o) => o.value));
    if (!validValues.has(classId)) {
      setClassId(classOptions[0]?.value ?? GLOBAL_ANNOUNCEMENT_CLASS_ID);
    }
  }, [classOptions, classId]);

  const handleSubmit = async () => {
    const validationErrors = validateAnnouncementForm({ title, content });
    setTitleError(validationErrors.title ?? "");
    setContentError(validationErrors.content ?? "");
    setClassError("");
    setAudienceError("");
    setRolesError("");
    if (Object.keys(validationErrors).length > 0) return;

    if (!classId) {
      setClassError("انتخاب کلاس الزامی است.");
      return;
    }
    setClassError("");

    if (isAdmin && classId !== GLOBAL_ANNOUNCEMENT_CLASS_ID && !targetAudience) {
      setAudienceError("انتخاب مخاطبان الزامی است.");
      return;
    }

    const roleError = validateGlobalAnnouncementRoles(isAdmin, classId, targetRoles);
    if (roleError) {
      setRolesError(roleError);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildAnnouncementPayload({
        title,
        content,
        classId,
        authorId,
        isAdmin,
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
      addToast(getErrorMessage(err, "خطا در ذخیره اطلاعیه."), "error");
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
    setTitleError("");
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setContentError("");
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
          error={titleError || undefined}
        />

        <Select
          label="مخاطب (کلاس)"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setClassError("");
            setRolesError("");
          }}
          options={classOptions}
          required
          error={classError || undefined}
        />

        {isAdmin && classId === GLOBAL_ANNOUNCEMENT_CLASS_ID && (
          <GlobalAnnouncementRoles
            targetRoles={targetRoles}
            onToggle={(role) => {
              toggleRole(role);
              setRolesError("");
            }}
            error={rolesError || undefined}
          />
        )}

        {isAdmin && classId !== GLOBAL_ANNOUNCEMENT_CLASS_ID && (
          <ClassAnnouncementAudience
            targetAudience={targetAudience}
            onChange={(value) => {
              setTargetAudience(value);
              setClassError("");
              setAudienceError("");
            }}
            error={audienceError || undefined}
          />
        )}

        <Textarea
          label="محتوا"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={5}
          placeholder={FORM_PLACEHOLDERS.ANNOUNCEMENT_CONTENT}
          required
          error={contentError || undefined}
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
