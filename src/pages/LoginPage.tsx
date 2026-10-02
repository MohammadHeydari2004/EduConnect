import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { isApiError } from "#/services/api/axiosInstance.ts";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const DEV_QUICK_ACCOUNTS = [
  { label: "مدیر", email: "admin@edu.com", role: "admin" },
  { label: "استاد", email: "teacher1@edu.com", role: "teacher" },
  { label: "دانشجو", email: "student1@edu.com", role: "student" },
] as const;

function LoginPage() {
  const navigate = useNavigate();
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
    if (!formData.email.trim()) {
      newErrors.email = "لطفاً ایمیل خود را وارد کنید.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "فرمت ایمیل معتبر نیست.";
    }
    if (!formData.password) {
      newErrors.password = "لطفاً رمز عبور خود را وارد کنید.";
    }
    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);
      navigate("/");
    } catch (err) {
      if (isApiError(err)) {
        addToast(err.userMessage, "error");
      } else if (err instanceof Error) {
        addToast(err.message, "error");
      } else {
        addToast("ورود ناموفق بود", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setFormData({ email, password: "123456" });
    setErrors({});
    try {
      setIsSubmitting(true);
      await login({ email, password: "123456" });
      navigate("/");
    } catch (err) {
      if (isApiError(err)) {
        addToast(err.userMessage, "error");
      } else if (err instanceof Error) {
        addToast(err.message, "error");
      } else {
        addToast("ورود ناموفق بود", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="relative">
              <Input
                label="رمز عبور"
                type={showPassword ? "text" : "password"}
                placeholder="رمز عبور خود را وارد کنید"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={errors.password}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-9 left-3 text-gray-400 transition hover:text-gray-600"
                aria-label={
                  showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
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
        {import.meta.env.DEV && (
          <Card className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-500">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>ورود سریع (محیط توسعه)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEV_QUICK_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleQuickLogin(account.email)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="font-bold">{account.label}</div>
                  <div className="mt-0.5 text-[10px] text-gray-400">
                    {account.role}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              رمز عبور همه حساب‌ها:{" "}
              <code className="rounded bg-gray-100 px-1 font-mono">123456</code>
            </p>
          </Card>
        )}
        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} EduConnect - تمامی حقوق محفوظ است
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
