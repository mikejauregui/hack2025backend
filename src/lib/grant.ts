import {
  createAuthenticatedClient,
  OpenPaymentsClientError,
  isFinalizedGrant,
} from "@interledger/open-payments";
import readline from "readline/promises";
import fs from "fs";
import { getClientById, getGrantById, insertGrant } from "./db";

const iddar_eur = "https://ilp.interledger-test.dev/d2667778";
const mike_eur = "https://ilp.interledger-test.dev/mikejauregui";

const privateKey = fs.readFileSync("private.key", "utf-8");

export async function createClient(client_id: string) {
  const clientObject = await getClientById(client_id);

  if (!clientObject) {
    throw new Error(`Client not found: ${client_id}`);
  }

  const client = await createAuthenticatedClient({
    walletAddressUrl: clientObject.wallet, // Make sure the wallet address starts with https:// (not $), and has no trailing slashes
    privateKey: privateKey,
    keyId: process.env.KEY_ID!, // The Key ID you set when creating the key pair on the Open Payments server
  });

  return client;
}

export async function createTxClient(client_id: string, amount: number) {
  const client = await createClient(client_id);
  const sendingWalletAddress = await client.walletAddress.get({
    url: iddar_eur,
  });
  const receivingWalletAddress = await client.walletAddress.get({
    url: mike_eur,
  });

  // Step 1: Get a grant for the incoming payment, so we can create the incoming payment on the receiving wallet address
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

  // Step 2: Create the incoming payment. This will be where funds will be received.
  const incomingPayment = await client.incomingPayment.create(
    {
      url: receivingWalletAddress.resourceServer,
      accessToken: incomingPaymentGrant?.access_token?.value,
    },
    {
      metadata: { purpose: "Test payment from script" },
      walletAddress: receivingWalletAddress.id,
      incomingAmount: {
        assetCode: receivingWalletAddress.assetCode,
        assetScale: receivingWalletAddress.assetScale,
        value: `${amount * 100}`, // Convert to smallest unit (e.g. cents)
      },
    }
  );

  // Step 3: Get a quote grant, so we can create a quote on the sending wallet address
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

  // Step 4: Create a quote, this gives an indication of how much it will cost to pay into the incoming payment
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

  return { client, sendingWalletAddress, quote };
}

// Step 5: Start the grant process for the outgoing payments.
// This is an interactive grant: the user (in this case, you) will need to accept the grant by navigating to the outputted link.
export async function startOutgoingPaymentGrant(
  client_id: string,
  amount?: number
) {
  if (!amount) {
    throw new Error("Amount is required");
  }
  const { client, sendingWalletAddress, quote } = await createTxClient(
    client_id,
    amount
  );

  const txID = Bun.randomUUIDv7();

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
        finish: {
          method: "redirect",
          uri: process.env.REDIRECT_URI! + "?t=" + txID, // The redirect URI you set when creating the client on the Open Payments server
          nonce: txID,
        },
      },
    }
  );

  // save txID, outgoingPaymentGrant.continue.uri and outgoingPaymentGrant.continue.access_token.value
  await insertGrant(
    txID,
    outgoingPaymentGrant.continue.uri,
    outgoingPaymentGrant.continue.access_token.value,
    client_id
  );

  return { txID, outgoingPaymentGrant };
}

// await readline
//   .createInterface({ input: process.stdin, output: process.stdout })
//   .question("\nPlease accept grant and press enter...");

export async function waitForGrantFinalization(
  client_id: string,
  txID: string
) {
  const client = await createClient(client_id);
  const outgoingPaymentGrant = await getGrantById(txID);

  if (!outgoingPaymentGrant) {
    throw new Error("No outgoing payment grant found");
  }

  let finalizedOutgoingPaymentGrant;

  const grantContinuationErrorMessage =
    "\nThere was an error continuing the grant. You probably have not accepted the grant at the url (or it has already been used up, in which case, rerun the script).";

  try {
    finalizedOutgoingPaymentGrant = await client.grant.continue({
      url: outgoingPaymentGrant.uri,
      accessToken: outgoingPaymentGrant.value,
    });
  } catch (err) {
    if (err instanceof OpenPaymentsClientError) {
      console.log(grantContinuationErrorMessage);
      process.exit();
    }

    throw err;
  }

  if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
    console.log(
      "There was an error continuing the grant. You probably have not accepted the grant at the url."
    );
    process.exit();
  }

  console.log(
    "\nStep 6: got finalized outgoing payment grant",
    finalizedOutgoingPaymentGrant
  );

  // write the `quoteGrant.access_token.value` somewhere safe if you want to reuse it later!
  fs.writeFileSync(
    "quoteGrant.token.txt",
    finalizedOutgoingPaymentGrant.access_token.value
  );
  console.log(
    "\nWrote quote grant access token to quoteGrant.token.txt, so you can reuse it later."
  );
}
