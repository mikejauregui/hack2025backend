import { Plus, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { useTransactions } from "../../hooks/useTransactions";
import { useWallets } from "../../hooks/useWallets";

export default function WalletsPage() {
  const { wallets } = useWallets();
  const { transactions } = useTransactions();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedWalletId && wallets.length) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  const activeWallet =
    wallets.find((wallet) => wallet.id === selectedWalletId) ?? wallets[0];
  const spotlightTransaction = useMemo(() => {
    if (!activeWallet) return transactions[0];
    return (
      transactions.find((txn) => txn.walletName === activeWallet.name) ??
      transactions[0]
    );
  }, [activeWallet, transactions]);
  const amountDisplay = spotlightTransaction
    ? `${spotlightTransaction.amount.toFixed(2)} ${spotlightTransaction.currency}`
    : "--";
  const faceMatchDisplay = spotlightTransaction?.faceMatch ?? 88;
  const snapshotSuffix = spotlightTransaction?.id?.slice(-4) ?? "0000";

  if (!activeWallet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[320px_1fr]">
        <section className="rounded-4xl border border-cerise-red-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cerise-red-500">Wallets</p>
              <h1 className="text-2xl font-semibold text-cerise-red-900">
                Manage balances
              </h1>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
            >
              <Plus className="size-4" />
              New
            </Button>
          </div>
          <div className="mt-6 space-y-4">
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

        <section className="space-y-6 rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-cerise-red-500">Transaction details</p>
            <h2 className="text-3xl font-semibold text-cerise-red-900">
              {spotlightTransaction?.merchantName}
            </h2>
            <p className="text-sm text-cerise-red-600">
              Completed on{" "}
              {spotlightTransaction
                ? new Date(spotlightTransaction.date).toLocaleDateString()
                : "--"}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-cerise-red-50 px-3 py-1 font-semibold text-cerise-red-700">
                {spotlightTransaction?.status ?? "completed"}
              </span>
              <span className="rounded-full bg-cerise-red-100 px-3 py-1 text-cerise-red-700">
                {spotlightTransaction?.walletName}
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
                  {spotlightTransaction?.walletName ?? activeWallet.name}
                </li>
                <li>Type: {spotlightTransaction?.paymentType ?? "outgoing"}</li>
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
                  <p>Snapshot ID #{snapshotSuffix}</p>
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
        </section>
      </div>
    </div>
  );
}
