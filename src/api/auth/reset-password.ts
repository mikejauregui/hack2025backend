import { ClientResponse } from "../../lib/Response";
import { resetPasswordWithToken } from "../../lib/auth";
import { validatePassword } from "../../lib/validation";

export async function resetPassword(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
        return ClientResponse.json({ error: "Token and new password required" }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return ClientResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    const user = await resetPasswordWithToken(token, password);

    if (!user) {
        return ClientResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    return ClientResponse.json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
