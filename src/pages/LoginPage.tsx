import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await login(formData);
      navigate("/");
    } catch (err) {
      if (err instanceof Error) addToast(err.message, "error");
      else addToast("ورود ناموفق بود", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <Card title="ورود به EduConnect">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="ایمیل"
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              autoFocus
            />
            <Input
              label="رمز عبور"
              type="password"
              placeholder="رمز عبور خود را وارد کنید"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "در حال ورود..." : "ورود"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
