import { useAuth } from "@/lib/auth";
import { LoginPage } from "@/components/LoginPage";
import { AppShell } from "@/components/AppShell";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0a0f1c]">
        <div className="aurora-bg" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-sky-400 spin-slow" />
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <AppShell />;
}
