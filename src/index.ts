import { serve } from "bun";
import index from "./app/index.html";

import { upload } from "./api/upload";
import { listTransactions } from "./api/transactions";
import { grantEndpoint, confirm } from "./api/grant";
import { listClients } from "./api/getClients";

// Auth Endpoints
import { signup } from "./api/auth/signup";
import { signin } from "./api/auth/signin";
import { signout } from "./api/auth/signout";
import { me } from "./api/auth/me";
import { verifyEmail } from "./api/auth/verify-email";
import { resendVerification } from "./api/auth/resend-verification";
import { forgotPassword } from "./api/auth/forgot-password";
import { resetPassword } from "./api/auth/reset-password";

// User & Wallet Endpoints
import { uploadFace } from "./api/users/upload-face";
import { listWallets, createWalletEndpoint } from "./api/wallets";

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

    // Auth Routes
    "/api/auth/signup": {
      POST: signup,
    },
    "/api/auth/signin": {
      POST: signin,
    },
    "/api/auth/signout": {
      POST: signout,
    },
    "/api/auth/me": {
      GET: me,
    },
    "/api/auth/verify-email": {
      GET: verifyEmail,
    },
    "/api/auth/resend-verification": {
      POST: resendVerification,
    },
    "/api/auth/forgot-password": {
      POST: forgotPassword,
    },
    "/api/auth/reset-password": {
      POST: resetPassword,
    },

    // User & Wallet Routes
    "/api/users/upload-face": {
      POST: uploadFace,
    },
    "/api/wallets": {
      GET: listWallets,
      POST: createWalletEndpoint,
    },

    "/api/grant": {
      POST: grantEndpoint,
    },

    "/api/clients/:id/confirm": {
      GET: confirm,
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
