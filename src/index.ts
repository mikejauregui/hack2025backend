import { serve } from "bun";
import index from "./app/index.html";
import { getClientById, getTransactions } from "./lib/db";
import { startOutgoingPaymentGrant } from "./lib/grant";
import { ClientResponse } from "./lib/Response";

import { upload } from "./api/upload";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/upload": {
      POST: upload,
    },

    "/api/transactions": {
      async GET(req) {
        const transactions = await getTransactions();
        return ClientResponse.json(
          transactions.map((t) => ({
            ...t,
            amount: t.amount / 100, // convert back to dollars
          }))
        );
      },
    },

    "/api/me": {
      async GET(req) {
        const client = await getClientById(
          "b3b1d743-564d-46b1-89f4-2543399f4055"
        );
        return ClientResponse.json({
          ...client,
          uri: "",
        });
      },
    },

    "/api/grant": {
      async POST(req) {
        const { client_id, amount } = await req.json();
        const grant = await startOutgoingPaymentGrant(client_id, amount);
        return ClientResponse.json(grant);
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
