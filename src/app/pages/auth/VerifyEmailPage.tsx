import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

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
        setStatus("error");
      }
    };
    verify();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "verifying" && <p>Verifying your email...</p>}
          {status === "success" && <p className="text-green-600">Email verified successfully! Redirecting...</p>}
          {status === "error" && <p className="text-red-600">Verification failed. The token may be invalid or expired.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
