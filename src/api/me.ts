import type { BunRequest } from "bun";
import { getClientById } from "src/lib/db";
import { ClientResponse } from "src/lib/Response";

export async function me(_req: BunRequest) {
  const client = await getClientById("b3b1d743-564d-46b1-89f4-2543399f4055");
  return ClientResponse.json({
    ...client,
    uri: "",
  });
}
