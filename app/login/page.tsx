import LoginForm from "@/components/LoginForm";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--portal-bg)] px-4 py-10">
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  );
}
