import { MailCheck, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { api } from "../../lib/api";

export default function CheckEmailPage() {
  const [, navigate] = useLocation();

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-verification", {});
      alert("Verification email resent!");
    } catch (e) {
      console.error("Resend verification failed", e);
      alert("Failed to resend email");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <Card className="mx-auto flex w-full max-w-lg flex-col items-center rounded-4xl border-cerise-red-100 bg-white/90 p-10 text-center shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-cerise-red-50 text-cerise-red-600">
          <MailCheck className="size-10" />
        </div>
        <CardContent className="mt-8 space-y-3 text-cerise-red-900">
          <h1 className="text-3xl font-semibold">Check your email</h1>
          <p className="text-sm text-cerise-red-600">
            We sent a verification link to your inbox. Click it to continue
            onboarding and unlock biometric payments.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={handleResend} className="w-full rounded-2xl">
              <RotateCcw className="size-4" /> Resend email
            </Button>
            <Button
              onClick={() => navigate("/signin")}
              variant="ghost"
              className="w-full rounded-2xl text-cerise-red-700"
            >
              Back to sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
