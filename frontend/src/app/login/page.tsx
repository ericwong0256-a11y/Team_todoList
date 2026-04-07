import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPageChrome } from "@/components/auth/AuthPageChrome";

export default function LoginPage() {
  return (
    <AuthPageChrome
      title="Welcome back"
      subtitle="Sign in to your workspace — tasks, teams, and realtime updates in one place."
      footer={{ label: "New here?", href: "/register", linkText: "Create an account" }}
    >
      <LoginForm />
    </AuthPageChrome>
  );
}
