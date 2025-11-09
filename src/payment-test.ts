/**
 * This script sets up an incoming payment on a receiving wallet address,
 * and a quote on the sending wallet address (after getting grants for both of the resources).
 *
 * The final step is asking for an outgoing payment grant for the sending wallet address.
 * Since this needs user interaction, you will need to navigate to the URL, and accept the interactive grant.
 *
 * To start, please add the variables for configuring the client & the wallet addresses for the payment.
 */

import { createAuthenticatedClient } from "@interledger/open-payments";
import fs from "fs";

async function getIncomingPaymentGrant(client, receivingWalletAddress) {
  const incomingPaymentGrant = await client.grant.request(
    {
      url: receivingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "incoming-payment",
            actions: ["read", "complete", "create"],
          },
        ],
      },
    }
  );
  return incomingPaymentGrant;
}

async function createIncomingPayment(
  client,
  receivingWalletAddress,
  incomingPaymentGrant,
  value
) {
  const incomingPayment = await client.incomingPayment.create(
    {
      url: receivingWalletAddress.resourceServer,
      accessToken: incomingPaymentGrant.access_token.value,
    },
    {
      walletAddress: receivingWalletAddress.id,
      incomingAmount: {
        assetCode: receivingWalletAddress.assetCode,
        assetScale: receivingWalletAddress.assetScale,
        value: value,
      },
    }
  );
  return incomingPayment;
}

async function getQuoteGrant(client, sendingWalletAddress) {
  const quoteGrant = await client.grant.request(
    {
      url: sendingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "quote",
            actions: ["create", "read"],
          },
        ],
      },
    }
  );
  return quoteGrant;
}

async function createQuote(
  client,
  sendingWalletAddress,
  quoteGrant,
  incomingPayment
) {
  const quote = await client.quote.create(
    {
      url: sendingWalletAddress.resourceServer,
      accessToken: quoteGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      receiver: incomingPayment.id,
      method: "ilp",
    }
  );
  return quote;
}

async function requestOutgoingPaymentGrant(
  client,
  sendingWalletAddress,
  quote
) {
  const outgoingPaymentGrant = await client.grant.request(
    {
      url: sendingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "outgoing-payment",
            actions: ["read", "create"],
            limits: {
              debitAmount: {
                assetCode: quote.debitAmount.assetCode,
                assetScale: quote.debitAmount.assetScale,
                value: quote.debitAmount.value,
              },
            },
            identifier: sendingWalletAddress.id,
          },
        ],
      },
      interact: {
        start: ["redirect"],
        // finish: {
        //   method: "redirect",
        //   // This is where you can (optionally) redirect a user to after going through interaction.
        //   // Keep in mind, you will need to parse the interact_ref in the resulting interaction URL,
        //   // and pass it into the grant continuation request.
        //   uri: "https://example.com",
        //   nonce: crypto.randomUUID(),
        // },
      },
    }
  );
  return outgoingPaymentGrant;
}

async function continueGrant(client, outgoingPaymentGrant) {
  const finalizedOutgoingPaymentGrant = await client.grant.continue({
    url: outgoingPaymentGrant.continue.uri,
    accessToken: outgoingPaymentGrant.continue.access_token.value,
  });
  return finalizedOutgoingPaymentGrant;
}

async function createOutgoingPayment(
  client,
  sendingWalletAddress,
  finalizedOutgoingPaymentGrant,
  quote
) {
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: sendingWalletAddress.resourceServer,
      accessToken: finalizedOutgoingPaymentGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      quoteId: quote.id,
    }
  );
  return outgoingPayment;
}

const privateKey = fs.readFileSync("private.key", "utf-8");
const walletAddressUrl = "https://ilp.interledger-test.dev/d2667778";

const client = await createAuthenticatedClient({
  walletAddressUrl: walletAddressUrl, // Make sure the wallet address starts with https:// (not $), and has no trailing slashes
  privateKey: privateKey,
  keyId: process.env.KEY_ID!,
});

export {
  getIncomingPaymentGrant,
  createIncomingPayment,
  getQuoteGrant,
  createQuote,
  requestOutgoingPaymentGrant,
  continueGrant,
  createOutgoingPayment,
  client,
};
