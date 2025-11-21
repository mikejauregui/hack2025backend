import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { api } from "../../lib/api";
import { useLocation } from "wouter";

export default function CheckEmailPage() {
  const [, navigate] = useLocation();

  const handleResend = async () => {
    try {
        await api.post("/auth/resend-verification", {});
        alert("Verification email resent!");
    } catch (e) {
        alert("Failed to resend email");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>We've sent a verification link to your email address.</p>
          <p>Please click the link to verify your account.</p>
          <div className="pt-4 space-y-2">
            <Button variant="outline" onClick={handleResend} className="w-full">Resend Verification Email</Button>
            <Button variant="ghost" onClick={() => navigate("/signin")} className="w-full">Back to Sign In</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
