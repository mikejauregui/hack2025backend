import { Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../contexts/AuthContext";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const [, navigate] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(formData);
      navigate("/check-email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl border border-cerise-red-100 bg-white/80 p-8 shadow-[0_20px_60px_rgba(167,44,69,0.12)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-cerise-red-600">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-cerise-red-50">
              <UserRound className="size-5" />
            </span>
            Create your lookandpay account
          </div>
          <p className="mt-4 text-sm text-cerise-red-700">
            Secure onboarding with AML-friendly data capture and biometric
            readiness.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-cerise-red-50/80 p-4">
              <div className="size-2 rounded-full bg-cerise-red-500" />
              <div>
                <p className="font-semibold text-cerise-red-900">
                  Step 1 · Account info
                </p>
                <p className="text-cerise-red-700">
                  Use government-issued details for faster verification.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-cerise-red-100/70 p-4 text-cerise-red-600">
              <div className="size-2 rounded-full bg-cerise-red-200" />
              Steps 2-4 cover email, face upload, and wallet creation.
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-cerise-red-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <header className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cerise-red-400">
              Step 1 of 4
            </p>
            <h1 className="text-3xl font-semibold text-cerise-red-900">
              Create your lookandpay account
            </h1>
            <p className="text-sm text-cerise-red-600">
              All fields are encrypted in transit.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl bg-cerise-red-50 p-3 text-sm text-cerise-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-cerise-red-900">
                Full name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Jane Miller"
                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cerise-red-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-cerise-red-900">
                Date of birth (DD/MM/YYYY)
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
              />
            </div>

            <Button
              type="submit"
              className="mt-8 w-full rounded-2xl py-6 text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-cerise-red-700">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-cerise-red-600 underline-offset-2 hover:underline"
            >
              Sign in here
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cerise-red-50/80 p-4 text-sm text-cerise-red-700">
            <Mail className="size-4" />
            We will send a verification link right after this step.
          </div>
        </div>
      </div>
    </div>
  );
}
