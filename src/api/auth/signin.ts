import { ClientResponse } from "../../lib/Response";
import { getUserByEmail, verifyPassword, createSession } from "../../lib/auth";

export async function signin(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return ClientResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return ClientResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return ClientResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await createSession(user.id, {
        user_agent: req.headers.get("user-agent") || undefined,
    });

    return ClientResponse.json({
      token: session.session_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified
      }
    });

  } catch (error) {
    console.error("Signin error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
