import { CheckCircle, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { api } from "../../lib/api";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("verifying");
  const [, navigate] = useLocation();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        if (res.ok) {
          setStatus("success");
          setTimeout(() => navigate("/onboarding/face"), 2000);
        } else {
          setStatus("error");
        }
      } catch (e) {
        console.error("Verification error", e);
        setStatus("error");
      }
    };
    verify();
  }, [navigate]);

  const state = {
    verifying: {
      icon: <Loader2 className="size-10 animate-spin text-cerise-red-500" />,
      title: "Hang tight",
      copy: "We are validating your verification link.",
    },
    success: {
      icon: <CheckCircle className="size-10 text-green-500" />,
      title: "Email verified",
      copy: "Redirecting you to face upload to finish onboarding.",
    },
    error: {
      icon: <TriangleAlert className="size-10 text-cerise-red-500" />,
      title: "Link expired",
      copy: "Request a new verification email to continue.",
    },
  }[status as "verifying" | "success" | "error"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <Card className="mx-auto flex w-full max-w-lg flex-col items-center rounded-4xl border-cerise-red-100 bg-white/90 p-10 text-center shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-cerise-red-50">
          {state.icon}
        </div>
        <div className="mt-8 space-y-3">
          <h1 className="text-3xl font-semibold text-cerise-red-900">
            {state.title}
          </h1>
          <p className="text-sm text-cerise-red-600">{state.copy}</p>
        </div>
        {status === "error" && (
          <Button
            className="mt-6 rounded-2xl"
            onClick={() => {
              window.location.href = "/check-email";
            }}
          >
            Request new link
          </Button>
        )}
      </Card>
    </div>
  );
}
