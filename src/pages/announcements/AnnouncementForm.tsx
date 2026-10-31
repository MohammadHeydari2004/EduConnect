import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import {
  DEFAULT_TARGET_ROLES,
  GLOBAL_ANNOUNCEMENT_CLASS_ID,
} from "#/configs/constants";
import { useToast } from "#/hooks/useToast.ts";
import { validateAnnouncementForm } from "#/pages/announcements/validators.ts";
import { announcementService } from "#/services/announcement.ts";
import {
  buildAnnouncementPayload,
  validateGlobalAnnouncementRoles,
  getAnnouncementClassOptions,
} from "#/pages/announcements/announcementPayload.ts";
import { GlobalAnnouncementRoles } from "#/pages/announcements/AnnouncementFormParts.tsx";
import { ClassAnnouncementAudience } from "#/pages/announcements/AnnouncementFormParts.tsx";
import type { Announcement, TargetAudience } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID, UserRole } from "#/types/common.ts";
import { getErrorMessage } from "#/utils/error.ts";
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
    initialData?.classId?.toString() ?? GLOBAL_ANNOUNCEMENT_CLASS_ID,
  );
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(
    initialData?.targetRoles ?? DEFAULT_TARGET_ROLES,
  );
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    initialData?.targetAudience ?? "students",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [classIdError, setClassIdError] = useState("");
  const [targetAudienceError, setTargetAudienceError] = useState("");
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
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors.form || "خطا در اعتبارسنجی");
      return;
    }

    if (!classId) {
      setClassIdError("انتخاب کلاس الزامی است.");
      setError("لطفاً خطاهای فرم را برطرف کنید.");
      return;
    }
    setClassIdError("");

    if (isAdmin && classId !== GLOBAL_ANNOUNCEMENT_CLASS_ID && !targetAudience) {
      setTargetAudienceError("انتخاب مخاطبان الزامی است.");
      setError("لطفاً خطاهای فرم را برطرف کنید.");
      return;
    }
    setTargetAudienceError("");

    const roleError = validateGlobalAnnouncementRoles(isAdmin, classId, targetRoles);
    if (roleError) {
      setError(roleError);
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
        classOptions,
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
    if (error || classIdError || targetAudienceError) {
      setError("");
      setClassIdError("");
      setTargetAudienceError("");
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    if (error || classIdError || targetAudienceError) {
      setError("");
      setClassIdError("");
      setTargetAudienceError("");
    }
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
          placeholder={FORM_PLACEHOLDERS.ANNOUNCEMENT_TITLE}
          required
        />

        <Select
          label="مخاطب (کلاس)"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            if (classIdError) setClassIdError("");
            if (error) setError("");
          }}
          options={classOptions}
          required
          error={classIdError}
        />

        {isAdmin && classId === GLOBAL_ANNOUNCEMENT_CLASS_ID && (
          <GlobalAnnouncementRoles
            targetRoles={targetRoles}
            onToggle={toggleRole}
          />
        )}

        {isAdmin && classId !== GLOBAL_ANNOUNCEMENT_CLASS_ID && (
          <ClassAnnouncementAudience
            targetAudience={targetAudience}
            onChange={(value) => {
              setTargetAudience(value);
              if (targetAudienceError) setTargetAudienceError("");
              if (error) setError("");
            }}
            error={targetAudienceError}
          />
        )}

        <Textarea
          label="محتوا"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={5}
          placeholder={FORM_PLACEHOLDERS.ANNOUNCEMENT_CONTENT}
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
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
