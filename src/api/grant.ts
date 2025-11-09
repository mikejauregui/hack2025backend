import type { BunRequest } from "bun";

export async function grant(_req: BunRequest) {
  const { client_id, amount } = await req.json();
  const grant = await startOutgoingPaymentGrant(client_id, amount);
  return ClientResponse.json(grant);
}
