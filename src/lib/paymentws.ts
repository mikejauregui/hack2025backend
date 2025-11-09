import { createTxClient } from "./grant";

export async function completePayment(
  client_id: string,
  amount: number,
  grantValue: string
) {
  const { client, sendingWalletAddress, quote } = await createTxClient(
    client_id,
    amount
  );
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: sendingWalletAddress.resourceServer,
      accessToken: grantValue, // finalizedOutgoingPaymentGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      quoteId: quote.id,
    }
  );

  return outgoingPayment;
}
