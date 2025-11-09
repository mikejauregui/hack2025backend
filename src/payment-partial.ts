import {
  client,
  createIncomingPayment,
  createOutgoingPayment,
  createQuote,
  getIncomingPaymentGrant,
  getQuoteGrant,
} from "./payment-test";

const iddar_eur = "https://ilp.interledger-test.dev/d2667778";
const mike_eur = "https://ilp.interledger-test.dev/mikejauregui";

export async function makePayment(amount: number) {
  const sendingWalletAddress = await client.walletAddress.get({
    url: iddar_eur,
  });
  const receivingWalletAddress = await client.walletAddress.get({
    url: mike_eur, // Make sure the wallet address starts with https:// (not $)
  });

  // Step 1: Get a grant for the incoming payment, so we can create the incoming payment on the receiving wallet address
  const incomingPaymentGrant = await getIncomingPaymentGrant(
    client,
    receivingWalletAddress
  );

  // Step 2: Create the incoming payment. This will be where funds will be received.
  const incomingPayment = await createIncomingPayment(
    client,
    receivingWalletAddress,
    incomingPaymentGrant,
    `${amount}` // in cents
  );

  // Step 3: Get a quote grant, so we can create a quote on the sending wallet address
  const quoteGrant = await getQuoteGrant(client, sendingWalletAddress);

  // Step 4: Create a quote, this gives an indication of how much it will cost to pay into the incoming payment
  const quote = await createQuote(
    client,
    sendingWalletAddress,
    quoteGrant,
    incomingPayment
  );

  const finalizedOutgoingPaymentGrant = {
    resourceServer:
      "https://ilp.interledger-test.dev/f537937b-7016-481b-b655-9f0d1014822c",
    access_token: {
      value: "F1DCA096179496874E6E",
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

  return outgoingPayment;
}
