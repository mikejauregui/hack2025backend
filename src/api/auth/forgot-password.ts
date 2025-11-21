import { ClientResponse } from "../../lib/Response";
import { generatePasswordResetToken, getUserByEmail } from "../../lib/auth";
import { sendPasswordResetEmail } from "../../lib/email";

export async function forgotPassword(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
        return ClientResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    // We don't want to reveal if user exists or not for security
    if (!user) {
        return ClientResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    const token = await generatePasswordResetToken(email);
    if (token) {
        await sendPasswordResetEmail(email, user.name, token);
    }

    return ClientResponse.json({ message: "If an account exists, a reset link has been sent." });

  } catch (error) {
    console.error("Forgot password error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
