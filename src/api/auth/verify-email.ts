import { ClientResponse } from "../../lib/Response";
import { verifyEmailToken } from "../../lib/auth";

export async function verifyEmail(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return ClientResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    const user = await verifyEmailToken(token);

    if (!user) {
      return ClientResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    return ClientResponse.json({
      message: "Email verified successfully",
      user
    });

  } catch (error) {
    console.error("Verify email error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
