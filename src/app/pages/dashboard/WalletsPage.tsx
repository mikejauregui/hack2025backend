import { AlertCircle, Plus, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { useTransactions } from "../../hooks/useTransactions";
import { useWallets } from "../../hooks/useWallets";

export default function WalletsPage() {
  const {
    wallets,
    loading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets,
  } = useWallets();
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedWalletId && wallets.length) {
      setSelectedWalletId(wallets[0].id);
    } else if (
      selectedWalletId &&
      !wallets.some((wallet) => wallet.id === selectedWalletId)
    ) {
      setSelectedWalletId(wallets[0]?.id ?? null);
    }
  }, [wallets, selectedWalletId]);

  const activeWallet =
    wallets.find((wallet) => wallet.id === selectedWalletId) ?? null;
  const spotlightTransaction = useMemo(() => {
    if (!transactions.length) return undefined;
    if (!activeWallet) return transactions[0];
    return (
      transactions.find(
        (txn) =>
          txn.walletId === activeWallet.id ||
          txn.walletName === activeWallet.name,
      ) ?? transactions[0]
    );
  }, [activeWallet, transactions]);
  const amountDisplay = spotlightTransaction
    ? `${spotlightTransaction.amount.toFixed(2)} ${spotlightTransaction.currency}`
    : "--";
  const faceMatchDisplay = spotlightTransaction?.faceMatch ?? 88;
  const snapshotSuffix = spotlightTransaction?.id?.slice(-4) ?? "0000";
  const snapshotLabel =
    spotlightTransaction?.snapshotKey ?? `snapshot-${snapshotSuffix}`;
  const showEmptyWalletState = !walletsLoading && wallets.length === 0;

  if (showEmptyWalletState) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-4xl border border-cerise-red-100 bg-white/95 p-10 text-center shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <h1 className="text-3xl font-semibold text-cerise-red-900">
            No wallets yet
          </h1>
          <p className="mt-2 text-sm text-cerise-red-600">
            Connect your first wallet to see balances and biometric receipts.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={refetchWallets} className="rounded-2xl">
              <RefreshCcw className="size-4" /> Try again
            </Button>
          </div>
          {(walletsError || transactionsError) && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cerise-red-50/80 px-4 py-3 text-sm text-cerise-red-700">
              <AlertCircle className="size-4" />
              {walletsError || transactionsError}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!activeWallet) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-4xl border border-cerise-red-100 bg-white/95 p-10 text-center shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <p className="text-sm text-cerise-red-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[320px_1fr]">
        <section className="rounded-4xl border border-cerise-red-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-cerise-red-500">Wallets</p>
              <h1 className="text-2xl font-semibold text-cerise-red-900">
                Manage balances
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
                onClick={() => {
                  refetchWallets();
                  refetchTransactions();
                }}
              >
                <RefreshCcw className="size-4" /> Sync
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
              >
                <Plus className="size-4" /> New
              </Button>
            </div>
          </div>
          {(walletsError || transactionsError) && (
            <div className="mt-4 flex items-center gap-2 rounded-3xl bg-cerise-red-50/80 p-3 text-sm text-cerise-red-700">
              <AlertCircle className="size-4" />
              {walletsError || transactionsError}
            </div>
          )}
          <div className="mt-6 space-y-4">
            {walletsLoading && (
              <div className="rounded-3xl border border-dashed border-cerise-red-100 bg-white/70 p-6 text-sm text-cerise-red-500">
                Loading wallets...
              </div>
            )}
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => setSelectedWalletId(wallet.id)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  wallet.id === activeWallet.id
                    ? "border-cerise-red-400 bg-cerise-red-50 shadow-inner"
                    : "border-cerise-red-100 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-cerise-red-500">
                  {wallet.walletUrl}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-cerise-red-900">
                  {wallet.name}
                </h2>
                <p className="text-sm text-cerise-red-600">
                  Updated {wallet.updatedAt ?? "recently"}
                </p>
                <p className="mt-3 text-2xl font-semibold text-cerise-red-900">
                  {wallet.balance.toFixed(2)} {wallet.currency}
                </p>
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="space-y-6 rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-cerise-red-500">Transaction details</p>
              <h2 className="text-3xl font-semibold text-cerise-red-900">
                {spotlightTransaction?.merchantName ?? "No transactions"}
              </h2>
              <p className="text-sm text-cerise-red-600">
                Completed on{" "}
                {spotlightTransaction?.date
                  ? new Date(spotlightTransaction.date).toLocaleDateString()
                  : "--"}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-cerise-red-50 px-3 py-1 font-semibold text-cerise-red-700">
                  {spotlightTransaction?.status ?? "pending"}
                </span>
                <span className="rounded-full bg-cerise-red-100 px-3 py-1 text-cerise-red-700">
                  {spotlightTransaction?.walletName ?? activeWallet.name}
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-cerise-red-50/70 p-6 text-cerise-red-900">
              <p className="text-sm text-cerise-red-600">Amount</p>
              <p className="text-4xl font-semibold">{amountDisplay}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-cerise-red-100 p-4 text-sm text-cerise-red-600">
                <p className="font-semibold text-cerise-red-900">Details</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    Wallet:{" "}
                    <span className="font-semibold text-cerise-red-900">
                      {spotlightTransaction?.walletName ?? activeWallet.name}
                    </span>
                  </li>
                  <li>
                    Date:{" "}
                    <span className="font-semibold text-cerise-red-900">
                      {spotlightTransaction?.date
                        ? new Date(spotlightTransaction.date).toLocaleString()
                        : "--"}
                    </span>
                  </li>
                  <li>Face match: {faceMatchDisplay}%</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-cerise-red-100 p-4 text-sm text-cerise-red-600">
                <p className="font-semibold text-cerise-red-900">
                  Biometric snapshot
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                    alt="Face snapshot"
                    className="h-24 w-24 rounded-3xl object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold text-cerise-red-900">
                      Match {faceMatchDisplay}%
                    </p>
                    <p className="text-sm text-cerise-red-600">
                      {snapshotLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl bg-cerise-red-50/80 p-6 text-sm text-cerise-red-700 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white">
                  <ShieldCheck className="size-6 text-cerise-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-cerise-red-900">
                    Compliance ready
                  </p>
                  <p>Stored with AML evidence + liveness record.</p>
                </div>
              </div>
              <Button className="rounded-2xl">Download receipt</Button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-cerise-red-50 px-4 py-2 text-cerise-red-700">
                <ShieldCheck className="size-4" /> Biometric verified
              </span>
              {transactionsLoading && (
                <span className="inline-flex items-center gap-2 rounded-full bg-cerise-red-50 px-4 py-2 text-cerise-red-500">
                  <AlertCircle className="size-4" /> Loading transactions...
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-cerise-red-50 px-4 py-2 text-cerise-red-700">
                0 disputed payments
              </span>
            </div>
          </section>

          <section className="rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-cerise-red-500">Receipts timeline</p>
              <h2 className="text-2xl font-semibold text-cerise-red-900">
                All transactions
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {transactionsLoading && (
                <div className="rounded-3xl border border-dashed border-cerise-red-100 bg-white/70 p-6 text-sm text-cerise-red-500">
                  Loading transactions...
                </div>
              )}
              {!transactionsLoading && transactions.length === 0 && (
                <div className="rounded-3xl border border-dashed border-cerise-red-100 bg-white/70 p-6 text-sm text-cerise-red-500">
                  No transactions yet.
                </div>
              )}
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-3xl border border-cerise-red-100 bg-white/80 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-cerise-red-500">
                        {transaction.date
                          ? new Date(transaction.date).toLocaleString()
                          : "--"}
                      </p>
                      <p className="text-xl font-semibold text-cerise-red-900">
                        {transaction.merchantName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-cerise-red-500">Amount</p>
                      <p className="text-2xl font-semibold text-cerise-red-900">
                        {transaction.amount.toFixed(2)} {transaction.currency}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-cerise-red-600">
                    <span>
                      Wallet:{" "}
                      <strong>{transaction.walletName ?? "Unknown"}</strong>
                    </span>
                    {transaction.biometricReceiptId && (
                      <span>
                        Receipt:{" "}
                        <strong>{transaction.biometricReceiptId}</strong>
                      </span>
                    )}
                    {transaction.faceMatch && (
                      <span>
                        Face match: <strong>{transaction.faceMatch}%</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
