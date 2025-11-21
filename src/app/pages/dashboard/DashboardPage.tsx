import {
  ArrowUpRight,
  CreditCard,
  LogOut,
  ReceiptText,
  Wallet2,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useTransactions } from "../../hooks/useTransactions";
import { useWallets } from "../../hooks/useWallets";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function DashboardPage() {
  const { user, signout } = useAuth();
  const { wallets } = useWallets();
  const { transactions } = useTransactions();

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
    [wallets],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-4 rounded-4xl border border-cerise-red-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-cerise-red-500">Welcome back</p>
            <h1 className="text-3xl font-semibold text-cerise-red-900">
              {user?.name ?? "lookandpay operator"}
            </h1>
            <p className="text-sm text-cerise-red-600">
              Manage wallets, biometric verifications, and transactions in one
              place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
            >
              <CreditCard className="size-4" />
              New charge
            </Button>
            <Button
              variant="ghost"
              className="rounded-2xl text-cerise-red-700"
              onClick={() => signout()}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-4xl border border-cerise-red-100 bg-linear-to-br from-cerise-red-100 via-white to-white p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
            <p className="text-sm font-semibold text-cerise-red-600">
              Total balance
            </p>
            <p className="mt-2 text-4xl font-semibold text-cerise-red-900">
              {formatCurrency(totalBalance, wallets[0]?.currency ?? "EUR")}
            </p>
            <div className="mt-6 grid gap-4 text-sm text-cerise-red-600 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/70 p-4">
                <p className="text-xs uppercase tracking-wide text-cerise-red-400">
                  Active wallets
                </p>
                <p className="text-2xl font-semibold text-cerise-red-900">
                  {wallets.length}
                </p>
              </div>
              <div className="rounded-3xl bg-white/70 p-4">
                <p className="text-xs uppercase tracking-wide text-cerise-red-400">
                  Transactions
                </p>
                <p className="text-2xl font-semibold text-cerise-red-900">
                  {transactions.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-4xl border border-cerise-red-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(133,30,49,0.08)]">
            <p className="text-sm font-semibold text-cerise-red-600">
              Quick actions
            </p>
            <div className="mt-4 space-y-3">
              <Button className="w-full rounded-2xl" variant="outline">
                <Wallet2 className="size-4" />
                Issue new wallet
              </Button>
              <Button className="w-full rounded-2xl" variant="outline">
                <ReceiptText className="size-4" />
                Export report
              </Button>
              <Link href="/transactions" className="block">
                <Button className="w-full rounded-2xl">
                  View all transactions
                  <ArrowUpRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-cerise-red-900">
              Your wallets
            </h2>
            <Link
              href="/wallets"
              className="text-sm font-semibold text-cerise-red-600 underline-offset-4 hover:underline"
            >
              Manage wallets
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="rounded-3xl border border-cerise-red-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(133,30,49,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-cerise-red-500">
                    {wallet.walletUrl || "Interledger"}
                  </p>
                  <span className="rounded-full bg-cerise-red-50 px-3 py-1 text-xs font-semibold text-cerise-red-600">
                    {wallet.isPrimary ? "Primary" : wallet.status}
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-cerise-red-900">
                  {wallet.name}
                </h3>
                <p className="text-sm text-cerise-red-600">
                  Updated {wallet.updatedAt ?? "recently"}
                </p>
                <p className="mt-4 text-3xl font-semibold text-cerise-red-900">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-4xl border border-cerise-red-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-cerise-red-900">
                Recent transactions
              </h2>
              <p className="text-sm text-cerise-red-600">
                Latest biometric payments across your wallets.
              </p>
            </div>
            <Link href="/transactions">
              <Button
                variant="outline"
                className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
              >
                View all
                <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="text-cerise-red-500">
                  <th className="py-3">Merchant</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Wallet</th>
                  <th className="py-3 text-right">Amount</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-t border-cerise-red-50 text-cerise-red-800"
                  >
                    <td className="py-4 font-semibold">{txn.merchantName}</td>
                    <td>{new Date(txn.date).toLocaleDateString()}</td>
                    <td>{txn.walletName}</td>
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
  );
}
