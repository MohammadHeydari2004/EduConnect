import { useState } from "react";
import Button from "#/components/ui/Button.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "#/types/user.ts";
import {
  validateCreateUser,
  validateUpdateUser,
  type UserFormErrors,
} from "./userValidation";

interface UserFormProps {
  isOpen: boolean;
  mode: "create" | "edit";
  user?: User | null;
  onClose: () => void;
  onCreate: (values: CreateUserPayload) => Promise<void>;
  onUpdate: (values: UpdateUserPayload) => Promise<void>;
}

function UserForm({
  isOpen,
  mode,
  user,
  onClose,
  onCreate,
  onUpdate,
}: UserFormProps) {
  const [createValues, setCreateValues] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role: "student",
    status: "active",
  });
  const [editValues, setEditValues] = useState<UpdateUserPayload>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "student",
    status: user?.status ?? "active",
  });
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapServerErrorToField = (message: string): UserFormErrors => {
    if (message.includes("ایمیل")) return { email: message };
    if (message.includes("نام")) return { name: message };
    return { form: message };
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateCreateUser(createValues);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    try {
      setIsSubmitting(true);
      setErrors({});
      await onCreate(createValues);
    } catch (err) {
      if (err instanceof Error) {
        setErrors(mapServerErrorToField(err.message));
      } else {
        setErrors({ form: "خطای غیرمنتظره‌ای رخ داد." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateUpdateUser(editValues);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    try {
      setIsSubmitting(true);
      setErrors({});
      await onUpdate(editValues);
    } catch (err) {
      if (err instanceof Error) {
        setErrors(mapServerErrorToField(err.message));
      } else {
        setErrors({ form: "خطای غیرمنتظره‌ای رخ داد." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === "create" ? "ایجاد کاربر جدید" : "ویرایش اطلاعات کاربر";

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <form
        onSubmit={mode === "create" ? handleCreateSubmit : handleEditSubmit}
        className="space-y-4"
      >
        {errors.form && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}
        <Input
          label="نام"
          value={mode === "create" ? createValues.name : editValues.name}
          onChange={(e) => {
            const value = e.target.value;
            if (mode === "create")
              setCreateValues((prev) => ({ ...prev, name: value }));
            else setEditValues((prev) => ({ ...prev, name: value }));
            if (errors.name)
              setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
        />
        <Input
          label="ایمیل"
          type="email"
          value={mode === "create" ? createValues.email : editValues.email}
          onChange={(e) => {
            const value = e.target.value;
            if (mode === "create")
              setCreateValues((prev) => ({ ...prev, email: value }));
            else setEditValues((prev) => ({ ...prev, email: value }));
            if (errors.email)
              setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
        />
        {mode === "create" && (
          <Input
            label="رمز عبور"
            type="password"
            value={createValues.password}
            onChange={(e) => {
              const value = e.target.value;
              setCreateValues((prev) => ({ ...prev, password: value }));
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
          />
        )}
        <Select
          label="نقش"
          value={mode === "create" ? createValues.role : editValues.role}
          onChange={(e) => {
            if (mode === "create") {
              setCreateValues((prev) => ({
                ...prev,
                role: e.target.value as CreateUserPayload["role"],
              }));
            } else {
              setEditValues((prev) => ({
                ...prev,
                role: e.target.value as UpdateUserPayload["role"],
              }));
            }
          }}
          options={[
            { label: "Admin", value: "admin" },
            { label: "Teacher", value: "teacher" },
            { label: "Student", value: "student" },
          ]}
          error={errors.role}
        />
        <Select
          label="وضعیت"
          value={mode === "create" ? createValues.status : editValues.status}
          onChange={(e) => {
            if (mode === "create") {
              setCreateValues((prev) => ({
                ...prev,
                status: e.target.value as CreateUserPayload["status"],
              }));
            } else {
              setEditValues((prev) => ({
                ...prev,
                status: e.target.value as UpdateUserPayload["status"],
              }));
            }
          }}
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          error={errors.status}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UserForm;
