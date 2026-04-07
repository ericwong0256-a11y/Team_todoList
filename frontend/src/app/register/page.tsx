import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthPageChrome } from "@/components/auth/AuthPageChrome";

export default function RegisterPage() {
  return (
    <AuthPageChrome
      wide
      title="Create your account"
      subtitle="Set up your profile and optional workspace. You can invite teammates or join teams later."
      footer={{ label: "Already have an account?", href: "/login", linkText: "Sign in" }}
    >
      <RegisterForm />
    </AuthPageChrome>
  );
}
