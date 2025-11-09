import type { BunRequest } from "bun";
import { getGrantById } from "src/lib/db";
import {
  startOutgoingPaymentGrant,
  waitForGrantFinalization,
} from "src/lib/grant";
import { completePayment } from "src/lib/paymentws";
import { ClientResponse } from "src/lib/Response";

export async function grantEndpoint(req: BunRequest) {
  const { client_id, amount } = await req.json();
  const grant = await startOutgoingPaymentGrant(client_id, amount);
  return ClientResponse.json(grant);
}

export async function confirm(req: BunRequest<"/api/clients/:id/confirm">) {
  const { id } = req.params;

  // const confirmation = await waitForGrantFinalization(id);
  // console.log("Confirmation:", confirmation);

  const grant = await getGrantById(id);
  if (!grant) {
    return ClientResponse.json({ error: "Grant not found" }, { status: 404 });
  }
  const confirmation = await waitForGrantFinalization(id);
  console.log("Confirmation:", confirmation);
  return ClientResponse.json(confirmation);
}
