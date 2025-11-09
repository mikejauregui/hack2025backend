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
  transcript?: string | null;
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
//   "grant_token" text,
// "wallet" text
// );

export interface Client {
  id: string;
  name: string;
  grant_token: string;
  wallet: string;
}

export function insertClient(
  name: string,
  grant_token: string,
  wallet: string
) {
  return sql`
    INSERT INTO clients (name, grant_token, wallet)
    VALUES (${name}, ${grant_token}, ${wallet})
    RETURNING *;
  `;
}

export async function getClients() {
  const clients = await sql<Client[]>`
    SELECT * FROM clients;
  `;
  return clients;
}

export async function getClientById(id: string) {
  const [client] = await sql<Client[]>`
    SELECT * FROM clients WHERE id = ${id};
  `;
  return client;
}

export async function getGrantTokenByClientId(id: string) {
  const [client] = await sql<Client[]>`
    SELECT * FROM clients WHERE id = ${id};
  `;
  return client?.grant_token;
}

export async function updateGrantTokenByClientId(
  id: string,
  grant_token: string
) {
  const [client] = await sql<Client[]>`
    UPDATE clients
    SET grant_token = ${grant_token}
    WHERE id = ${id}
    RETURNING *;
  `;
  return client;
}

// "grants_manager" (
//   "id" uuid PRIMARY KEY,
//   "uri" text,
//   "value" text,
//   "client_id" uuid
// );

export interface Grant {
  id: string;
  uri: string;
  value: string;
  client_id: string;
}

export async function insertGrant(
  id: string,
  uri: string,
  value: string,
  client_id: string
) {
  return sql<Grant[]>`
    INSERT INTO grants_manager (id, uri, value, client_id)
    VALUES (${id}, ${uri}, ${value}, ${client_id})
    RETURNING *;
  `;
}

export async function getGrantById(id: string) {
  const [grant] = await sql<Grant[]>`
    SELECT * FROM grants_manager WHERE client_id = ${id};
  `;
  return grant;
}
