import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import { EyeIcon, EyeSlashIcon } from "#/components/common/icons";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { getErrorMessage } from "#/utils/error.ts";
import { validateEmail, validatePassword } from "#/pages/users/validators.ts";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailError = validateEmail(formData.email);
    if (emailError !== true) {
      newErrors.email = emailError;
    }
    const passwordError = validatePassword(formData.password);
    if (passwordError !== true) {
      newErrors.password = passwordError;
    }
    return newErrors;
  };

  const performLogin = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      await login({ email, password });
    } catch (err) {
      addToast(getErrorMessage(err, "ورود ناموفق بود."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    await performLogin(formData.email, formData.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
            <span className="text-5xl" role="img" aria-label="لوگوی EduConnect">
              🎓
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">EduConnect</h1>
          <p className="mt-2 text-sm text-gray-600">
            سامانه جامع ارتباط اساتید و دانشجویان
          </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="ایمیل"
              type="email"
              placeholder="example@edu.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
              required
            />
            <Input
              label="رمز عبور"
              type={showPassword ? "text" : "password"}
              placeholder="رمز عبور خود را وارد کنید"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 transition hover:text-gray-600"
                  aria-label={
                    showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "در حال ورود..." : "ورود به حساب"}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} EduConnect - تمامی حقوق محفوظ است
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
