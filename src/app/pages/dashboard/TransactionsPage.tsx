import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useTransactions } from "../../hooks/useTransactions";

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "failed":
      return "bg-cerise-red-100 text-cerise-red-700";
    default:
      return "bg-amber-50 text-amber-600";
  }
}

export default function TransactionsPage() {
  const { transactions } = useTransactions();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      transactions.filter((txn) =>
        `${txn.merchantName} ${txn.walletName}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [transactions, query],
  );
  const currencyLabel = filtered[0]?.currency ?? "EUR";
  const avgFaceMatch = filtered.length
    ? filtered.reduce((sum, txn) => sum + (txn.faceMatch ?? 80), 0) /
      filtered.length
    : 0;
  const outgoingVolume = filtered
    .filter((txn) => txn.amount < 0)
    .reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8 rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
        <header>
          <p className="text-sm text-cerise-red-500">Payment activity</p>
          <h1 className="text-3xl font-semibold text-cerise-red-900">
            Transactions
          </h1>
          <p className="text-sm text-cerise-red-600">
            Monitor biometric approvals, wallet moves, and AML blocks in real
            time.
          </p>
        </header>

        <div className="flex flex-col gap-4 rounded-3xl bg-cerise-red-50/80 p-4 text-sm text-cerise-red-600 sm:flex-row sm:items-center sm:justify-between">
          <div>Showing {filtered.length} results</div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="ghost"
              className="rounded-2xl border border-cerise-red-100 text-cerise-red-700"
            >
              <Filter className="size-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cerise-red-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search merchant or wallet"
              className="h-12 rounded-3xl border-cerise-red-100 bg-cerise-red-50/40 pl-11"
            />
          </div>
          <Button className="rounded-3xl">New transfer</Button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-cerise-red-50">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-cerise-red-50 text-cerise-red-500">
              <tr>
                <th className="px-6 py-3">Merchant</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Wallet</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr key={txn.id} className="border-t border-cerise-red-50">
                  <td className="px-6 py-4 font-semibold text-cerise-red-900">
                    {txn.merchantName}
                  </td>
                  <td className="px-6 py-4 text-cerise-red-600">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-cerise-red-600">
                    {txn.walletName}
                  </td>
                  <td className="px-6 py-4 text-cerise-red-600">
                    {txn.paymentType}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-cerise-red-900">
                    {txn.amount.toFixed(2)} {txn.currency}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(txn.status)}`}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 rounded-3xl bg-cerise-red-50/80 p-6 text-sm text-cerise-red-700 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-cerise-red-500">
              Avg face match
            </p>
            <p className="text-2xl font-semibold text-cerise-red-900">
              {avgFaceMatch.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-cerise-red-500">
              Failed payments
            </p>
            <p className="text-2xl font-semibold text-cerise-red-900">
              {filtered.filter((txn) => txn.status === "failed").length}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-cerise-red-500">
              Outgoing volume
            </p>
            <p className="text-2xl font-semibold text-cerise-red-900">
              {outgoingVolume.toFixed(2)} {currencyLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
