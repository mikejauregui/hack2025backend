import { ClientResponse } from "../../lib/Response";
import { validateSession, generateEmailVerificationToken, getUserById } from "../../lib/auth";
import { sendVerificationEmail } from "../../lib/email";

export async function resendVerification(req: Request) {
  try {
    // This endpoint should be protected
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return ClientResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await validateSession(token);

    if (!user) {
        return ClientResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (user.email_verified) {
        return ClientResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Generate new token
    const verificationToken = await generateEmailVerificationToken(user.id);
    
    // Send email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return ClientResponse.json({ message: "Verification email sent" });

  } catch (error) {
    console.error("Resend verification error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
