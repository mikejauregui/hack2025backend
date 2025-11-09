import { serve } from "bun";
import index from "./app/index.html";

import { upload } from "./api/upload";
import { listTransactions } from "./api/transactions";
import { me } from "./api/me";
import { grant } from "./api/grant";
import { listClients } from "./api/getClients";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/upload": {
      POST: upload,
    },

    "/api/transactions": {
      GET: listTransactions,
    },

    "/api/me": {
      GET: me,
    },

    "/api/grant": {
      POST: grant,
    },

    "/api/clients": {
      GET: listClients,
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
