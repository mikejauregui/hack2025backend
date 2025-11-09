import type { BunRequest } from "bun";
import { getClients } from "src/lib/db";
import { ClientResponse } from "src/lib/Response";

export async function listClients(_req: BunRequest) {
  const clients = await getClients();
  return ClientResponse.json(clients);
}
