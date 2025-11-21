import { ClientResponse } from "../../lib/Response";
import { deleteSession } from "../../lib/auth";

export async function signout(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        // If no token provided, consider it a success (no session to delete)
       return ClientResponse.json({ message: "Signed out successfully" });
    }

    const token = authHeader.split(" ")[1];
    await deleteSession(token);

    return ClientResponse.json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("Signout error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
