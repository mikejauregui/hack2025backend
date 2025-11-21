import { ClientResponse } from "../../lib/Response";
import { validateSession } from "../../lib/auth";

export async function me(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return ClientResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await validateSession(token);

    if (!user) {
      return ClientResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    return ClientResponse.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
