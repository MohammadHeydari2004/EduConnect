import Button from "#/components/ui/Button.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Input from "#/components/ui/Input.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "#/pages/users/validators.ts";
import { isApiError } from "#/services/api/axiosInstance.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "#/types/user.ts";
import type { RecordStatus, UserRole } from "#/types/common.ts";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useEffect } from "react";

type UserFormValues = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: RecordStatus;
};

interface UserFormProps {
  isOpen: boolean;
  mode: "create" | "edit";
  user?: User | null;
  onClose: () => void;
  onCreate: (values: CreateUserPayload) => Promise<void>;
  onUpdate: (values: UpdateUserPayload) => Promise<void>;
}

function resolveError(err: unknown): {
  field: keyof UserFormValues | "root";
  message: string;
} {
  let message: string;
  if (isApiError(err)) {
    message = err.userMessage;
  } else if (err instanceof Error) {
    message = err.message;
  } else {
    return { field: "root", message: "خطای غیرمنتظره‌ای رخ داد." };
  }

  if (message.includes("قبلاً ثبت شده")) {
    return { field: "email", message };
  }
  return { field: "root", message };
}

function UserForm({
  isOpen,
  mode,
  user,
  onClose,
  onCreate,
  onUpdate,
}: UserFormProps) {
   const {
     register,
     handleSubmit,
     formState: { errors, isSubmitting },
     reset,
     setError,
     clearErrors,
   } = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      status: "active",
    },
    mode: mode === "edit" ? "onChange" : "onBlur",
  });

  useEffect(() => {
    if (mode === "edit" && user) {
      reset({
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "student",
        status: user.status ?? "active",
      });
      clearErrors();
    }
   }, [mode, user, reset, clearErrors]);

  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    try {
      if (mode === "create") {
        await onCreate({
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password?.trim() ?? "",
          role: data.role,
          status: data.status,
        });
      } else {
        await onUpdate({
          name: data.name.trim(),
          email: data.email.trim(),
          role: data.role,
          status: data.status,
        });
      }
      onClose();
    } catch (err) {
      const { field, message } = resolveError(err);
      setError(field, { type: "server", message });
    }
  };

  const title = mode === "create" ? "ایجاد کاربر جدید" : "ویرایش اطلاعات کاربر";

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          {errors.root && (
            <ErrorAlert message={errors.root.message ?? "خطایی رخ داد."} />
          )}

          <Input
            label="نام"
            {...register("name", {
              required: "لطفاً نام خود را وارد کنید.",
              validate: (value) => validateName(value),
            })}
            autoFocus
            autoComplete="name"
            required
            error={errors.name?.message}
          />

          <Input
            label="ایمیل"
            {...register("email", {
              required: "لطفاً ایمیل خود را وارد کنید.",
              validate: (value) => validateEmail(value),
            })}
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
          />

          {mode === "create" && (
            <Input
              label="رمز عبور"
              {...register("password", {
                required: "لطفاً رمز عبور خود را وارد کنید.",
                validate: (value) => validatePassword(value),
              })}
              type="password"
              autoComplete="new-password"
              required
              error={errors.password?.message}
            />
          )}

          <Select
            label="نقش"
            {...register("role", {
              required: "لطفاً نقش خود را انتخاب کنید.",
            })}
            required
            options={[
              { label: "مدیر", value: "admin" },
              { label: "استاد", value: "teacher" },
              { label: "دانشجو", value: "student" },
            ]}
            error={errors.role?.message}
          />

          <Select
            label="وضعیت"
            {...register("status", {
              required: "لطفاً وضعیت خود را انتخاب کنید.",
            })}
            required
            options={[
              { label: "فعال", value: "active" },
              { label: "غیرفعال", value: "inactive" },
            ]}
            error={errors.status?.message}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default UserForm;
