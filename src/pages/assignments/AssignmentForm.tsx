import { useState } from "react";
import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { assignmentService } from "#/services/modules/assignmentService.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";

interface Props {
  isOpen: boolean;
  initialData?: Assignment | null;
  availableClasses: ClassItem[];
  teacherId: number;
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
  const [classId, setClassId] = useState<number>(
    Number(initialData?.classId ?? availableClasses[0]?.id ?? 0),
  );
  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? new Date(initialData.deadline).toISOString().split("T")[0]
      : "",
  );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !deadline || !classId) {
      setError("عنوان، ددلاین و انتخاب کلاس الزامی هستند.");
      return;
    }
    try {
      setIsSubmitting(true);
      const selectedClass = availableClasses.find((c) => c.id === classId);
      const finalTeacherId = isAdmin
        ? (selectedClass?.teacherId ?? teacherId)
        : teacherId;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        classId,
        teacherId: finalTeacherId,
        deadline: new Date(deadline).toISOString(),
      };

      if (initialData) {
        await assignmentService.update(initialData.id, payload);
      } else {
        await assignmentService.create(payload);
      }
      onSuccess();
    } catch {
      setError("خطا در ذخیره تکلیف.");
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
          label="عنوان"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان تکلیف"
        />
        <Select
          label="کلاس"
          value={classId}
          onChange={(e) => setClassId(Number(e.target.value))}
          options={availableClasses.map((c) => ({
            label: c.title,
            value: c.id,
          }))}
        />
        <Textarea
          label="توضیحات"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="شرح تکلیف..."
        />
        <Input
          label="ددلاین"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
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
