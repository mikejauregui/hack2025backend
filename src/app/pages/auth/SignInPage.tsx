import { Lock } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../contexts/AuthContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signin } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signin(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 lg:flex-row">
        <div className="rounded-4xl border border-cerise-red-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-cerise-red-600">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-cerise-red-50">
              <Lock className="size-5" />
            </span>
            Welcome back
          </div>
          <p className="mt-4 text-sm text-cerise-red-700">
            Sign in to continue managing biometric payments and wallet controls.
          </p>
          <div className="mt-6 rounded-2xl bg-cerise-red-50/80 p-4 text-sm text-cerise-red-700">
            Use the same email you verified during onboarding. Reset support is
            available via the help center.
          </div>
        </div>

        <div className="w-full rounded-4xl border border-cerise-red-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <header className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cerise-red-400">
              Secure access
            </p>
            <h1 className="text-3xl font-semibold text-cerise-red-900">
              Sign in to your account
            </h1>
            <p className="text-sm text-cerise-red-600">
              Multi-factor prompts may follow on trusted devices.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl bg-cerise-red-50 p-3 text-sm text-cerise-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cerise-red-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@company.com"
                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-cerise-red-900">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
              />
            </div>

            <Button
              type="submit"
              className="mt-8 w-full rounded-2xl py-6 text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-cerise-red-700">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-cerise-red-600 underline-offset-2 hover:underline"
            >
              Create one here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
