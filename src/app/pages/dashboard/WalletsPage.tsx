import { AlertCircle, Plus, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  TransactionRecord,
  useTransactions,
} from "../../hooks/useTransactions";
import { useWallets } from "../../hooks/useWallets";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

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
  const walletTransactions: TransactionRecord[] = useMemo(() => {
    if (!activeWallet) return [];
    return transactions.filter(
      (txn) =>
        txn.walletId === activeWallet.id ||
        txn.walletName === activeWallet.name,
    );
  }, [activeWallet, transactions]);
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
            <div className="flex flex-col gap-3">
              <p className="text-sm text-cerise-red-500">Wallet overview</p>
              <h2 className="text-3xl font-semibold text-cerise-red-900">
                {activeWallet.name}
              </h2>
              <p className="text-sm text-cerise-red-600">
                {activeWallet.walletUrl || "Interledger wallet"}
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide">
                {activeWallet.isPrimary && (
                  <span className="rounded-full bg-cerise-red-50 px-3 py-1 text-cerise-red-700">
                    Primary wallet
                  </span>
                )}
                <span className="rounded-full bg-cerise-red-100 px-3 py-1 text-cerise-red-700">
                  {activeWallet.status}
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-cerise-red-100 bg-white/80 p-5">
                <p className="text-sm text-cerise-red-500">Balance</p>
                <p className="mt-2 text-3xl font-semibold text-cerise-red-900">
                  {formatCurrency(activeWallet.balance, activeWallet.currency)}
                </p>
              </div>
              <div className="rounded-3xl border border-cerise-red-100 bg-white/80 p-5">
                <p className="text-sm text-cerise-red-500">Currency</p>
                <p className="mt-2 text-2xl font-semibold text-cerise-red-900">
                  {activeWallet.currency}
                </p>
              </div>
              <div className="rounded-3xl border border-cerise-red-100 bg-white/80 p-5">
                <p className="text-sm text-cerise-red-500">Wallet address</p>
                <p className="mt-2 text-sm text-cerise-red-900">
                  {activeWallet.walletUrl || "Not provided"}
                </p>
              </div>
              <div className="rounded-3xl border border-cerise-red-100 bg-white/80 p-5">
                <p className="text-sm text-cerise-red-500">Last updated</p>
                <p className="mt-2 text-lg font-semibold text-cerise-red-900">
                  {activeWallet.updatedAt
                    ? new Date(activeWallet.updatedAt).toLocaleString()
                    : "Recently"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-cerise-red-500">Wallet activity</p>
                <h2 className="text-2xl font-semibold text-cerise-red-900">
                  Recent transactions
                </h2>
              </div>
              <Button
                variant="outline"
                className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
                onClick={() => refetchTransactions()}
              >
                Refresh activity
              </Button>
            </div>
            {transactionsError && (
              <div className="mt-4 flex items-center gap-2 rounded-3xl bg-cerise-red-50/80 p-3 text-sm text-cerise-red-700">
                <AlertCircle className="size-4" />
                {transactionsError}
              </div>
            )}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="text-cerise-red-500">
                    <th className="py-3">Merchant</th>
                    <th className="py-3">Date</th>
                    <th className="py-3 text-right">Amount</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsLoading && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-sm text-cerise-red-500"
                      >
                        Loading transactions...
                      </td>
                    </tr>
                  )}
                  {!transactionsLoading && walletTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-sm text-cerise-red-500"
                      >
                        No wallet activity yet.
                      </td>
                    </tr>
                  )}
                  {walletTransactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-t border-cerise-red-50 text-cerise-red-800"
                    >
                      <td className="py-4 font-semibold">{txn.merchantName}</td>
                      <td>
                        {txn.date ? new Date(txn.date).toLocaleString() : "--"}
                      </td>
                      <td className="text-right font-semibold">
                        {formatCurrency(txn.amount, txn.currency)}
                      </td>
                      <td className="text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            txn.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : txn.status === "failed"
                                ? "bg-cerise-red-100 text-cerise-red-700"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
