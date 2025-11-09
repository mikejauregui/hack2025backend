import { sql, SQL } from "bun";

// catabase has a table name transactions
// with columns id (UUID), amount (int),
// currency (varchar[20]), store (int)
// timestamp (timestamp with time zone)
// snapshot (uuid)
// transcript (text, nullable)

export interface Transaction {
  amount: number;
  currency: string;
  store: number;
  snapshot_id: string;
  transcript?: string;
}

export async function insertTransaction(request: Transaction) {
  const [transaction] = await sql`
    INSERT INTO transactions (amount, currency, store, snapshot, transcript)
    VALUES (${request.amount}, ${request.currency}, ${request.store}, ${request.snapshot_id}, ${request.transcript})
    RETURNING *;
  `;
  return transaction;
}

export async function getTransactions() {
  const transactions = await sql<Transaction[]>`
    SELECT * FROM transactions ORDER BY timestamp DESC;
  `;
  return transactions;
}

export async function getTransactionById(id: string) {
  const [transaction] = await sql<Transaction[]>`
    SELECT * FROM transactions WHERE id = ${id};
  `;
  return transaction;
}

// "clients" (
//   "id" uuid PRIMARY KEY DEFAULT gen_random_uuid (),
//   "name" text,
//   "grant_token" text
// );

export function insertClient(name: string, grant_token: string) {
  return sql`
    INSERT INTO clients (name, grant_token)
    VALUES (${name}, ${grant_token})
    RETURNING *;
  `;
}

export function getGrantTokenByClientName(name: string) {
  return sql<Transaction[]>`
    SELECT grant_token FROM clients WHERE name = ${name};
  `;
}
