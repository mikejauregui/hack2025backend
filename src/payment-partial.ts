import {
  isFinalizedGrant,
  OpenPaymentsClientError,
} from "@interledger/open-payments";
import {
  client,
  continueGrant,
  createIncomingPayment,
  createOutgoingPayment,
  createQuote,
  getIncomingPaymentGrant,
  getQuoteGrant,
  requestOutgoingPaymentGrant,
} from "./payment-test";
import readline from "readline/promises";
import { access } from "fs";

const iddar_eur = "https://ilp.interledger-test.dev/d2667778";
const mike_eur = "https://ilp.interledger-test.dev/mikejauregui";

const sendingWalletAddress = await client.walletAddress.get({
  url: iddar_eur,
});
const receivingWalletAddress = await client.walletAddress.get({
  url: mike_eur, // Make sure the wallet address starts with https:// (not $)
});

console.log(
  "Got wallet addresses. We will set up a payment between the sending and the receiving wallet address",
  { receivingWalletAddress, sendingWalletAddress }
);

// Step 1: Get a grant for the incoming payment, so we can create the incoming payment on the receiving wallet address
const incomingPaymentGrant = await getIncomingPaymentGrant(
  client,
  receivingWalletAddress
);

console.log(
  "\nStep 1: got incoming payment grant for receiving wallet address",
  incomingPaymentGrant
);

// Step 2: Create the incoming payment. This will be where funds will be received.
const incomingPayment = await createIncomingPayment(
  client,
  receivingWalletAddress,
  incomingPaymentGrant,
  `${20 * 100}` // in cents
);

console.log(
  "\nStep 2: created incoming payment on receiving wallet address",
  incomingPayment
);

// Step 3: Get a quote grant, so we can create a quote on the sending wallet address
const quoteGrant = await getQuoteGrant(client, sendingWalletAddress);

console.log("\nStep 3: got quote grant on sending wallet address", quoteGrant);

// Step 4: Create a quote, this gives an indication of how much it will cost to pay into the incoming payment
const quote = await createQuote(
  client,
  sendingWalletAddress,
  quoteGrant,
  incomingPayment
);

console.log("\nStep 4: got quote on sending wallet address", quote);
const finalizedOutgoingPaymentGrant = {
  resourceServer:
    "https://auth.interledger-test.dev/continue/cae5bde6-4797-4dc2-9486-29d701d9ae5b",
  access_token: {
    value: "b3b1d743-564d-46b1-89f4-2543399f4055",
  },
};

// Step 7: Finally, create the outgoing payment on the sending wallet address.
// This will make a payment from the outgoing payment to the incoming one (over ILP)
const outgoingPayment = await createOutgoingPayment(
  client,
  sendingWalletAddress,
  finalizedOutgoingPaymentGrant,
  quote
);

console.log(
  "\nStep 7: Created outgoing payment. Funds will now move from the outgoing payment to the incoming payment.",
  outgoingPayment
);
