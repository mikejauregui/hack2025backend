import type { BunRequest } from "bun";
import { getTransactions } from "src/lib/db";
import { ClientResponse } from "src/lib/Response";

export async function listTransactions(_req: BunRequest) {
  const transactions = await getTransactions();
  return ClientResponse.json(
    transactions.map((t) => ({
      ...t,
      amount: t.amount / 100, // convert back to dollars
    }))
  );
}
