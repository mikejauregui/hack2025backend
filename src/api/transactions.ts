import { validateSession } from "src/lib/auth";
import { getTransactionsByUserId } from "src/lib/db";
import { ClientResponse } from "src/lib/Response";

export async function listTransactions(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return ClientResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await validateSession(token);
    if (!user) {
      return ClientResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const transactions = await getTransactionsByUserId(user.id);
    return ClientResponse.json({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount) / 100,
      })),
    });
  } catch (error) {
    console.error("List transactions error", error);
    return ClientResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
