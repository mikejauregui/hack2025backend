import {
  AlertCircle,
  Camera,
  Images,
  Mail,
  ShieldCheck,
  User2,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useFaceImages } from "../../hooks/useFaceImages";
import { useTransactions } from "../../hooks/useTransactions";

function formatCurrency(amount?: number, currency: string = "EUR") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ProfilePage() {
  const { user } = useAuth();
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions();
  const {
    faceImages,
    loading: facesLoading,
    error: facesError,
    refetch: refetchFaceImages,
  } = useFaceImages();

  const latestTransaction = useMemo(
    () => (transactions.length ? transactions[0] : null),
    [transactions],
  );

  const faceMatch = latestTransaction?.faceMatch ?? null;
  const snapshotLabel = latestTransaction?.snapshotKey
    ? latestTransaction.snapshotKey
    : latestTransaction?.id
      ? `snapshot-${latestTransaction.id.slice(-4)}`
      : "snapshot-0000";
  const biometricImage =
    latestTransaction?.snapshotImage ||
    faceImages.find((face) => face.isPrimary)?.imageData ||
    faceImages[0]?.imageData ||
    null;
  const receipts = transactions.slice(0, 8);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="flex flex-col gap-4 rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-cerise-red-500">Profile overview</p>
            <h1 className="text-3xl font-semibold text-cerise-red-900">
              {user?.name ?? "Account owner"}
            </h1>
            <p className="text-sm text-cerise-red-600">
              {user?.email ?? "No email on file"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
              onClick={() => refetchTransactions()}
            >
              Refresh profile data
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
            <div className="flex items-center gap-3 text-cerise-red-700">
              <span className="flex size-12 items-center justify-center rounded-3xl bg-cerise-red-50">
                <User2 className="size-6" />
              </span>
              <div>
                <p className="text-sm text-cerise-red-500">Personal details</p>
                <h2 className="text-xl font-semibold text-cerise-red-900">
                  Identity
                </h2>
              </div>
            </div>
            <dl className="mt-6 space-y-4 text-sm text-cerise-red-600">
              <div className="flex items-center justify-between">
                <dt>Name</dt>
                <dd className="font-semibold text-cerise-red-900">
                  {user?.name ?? "--"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2">
                  <Mail className="size-4" /> Email
                </dt>
                <dd className="text-right">
                  <p className="font-semibold text-cerise-red-900">
                    {user?.email ?? "--"}
                  </p>
                  {user?.email_verified && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Verified
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>User ID</dt>
                <dd className="font-mono text-sm text-cerise-red-900">
                  {user?.id ?? "--"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Status</dt>
                <dd>
                  <span className="rounded-full bg-cerise-red-50 px-3 py-1 text-xs font-semibold text-cerise-red-700">
                    {user?.email_verified
                      ? "Email verified"
                      : "Verification pending"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
            <div className="flex items-center gap-3 text-cerise-red-700">
              <span className="flex size-12 items-center justify-center rounded-3xl bg-cerise-red-50">
                <ShieldCheck className="size-6" />
              </span>
              <div>
                <p className="text-sm text-cerise-red-500">Compliance</p>
                <h2 className="text-xl font-semibold text-cerise-red-900">
                  Verification status
                </h2>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-cerise-red-600">
              <li className="flex items-center justify-between rounded-3xl bg-white/70 px-4 py-3">
                <span>Biometric evidence</span>
                <span className="text-cerise-red-900">
                  {faceMatch != null
                    ? `${faceMatch}% match`
                    : "Awaiting capture"}
                </span>
              </li>
              <li className="flex items-center justify-between rounded-3xl bg-white/70 px-4 py-3">
                <span>Disputed payments</span>
                <span className="font-semibold text-cerise-red-900">
                  0 open cases
                </span>
              </li>
              <li className="flex items-center justify-between rounded-3xl bg-white/70 px-4 py-3">
                <span>Last refresh</span>
                <span className="text-cerise-red-900">
                  {transactionsLoading
                    ? "Loading"
                    : latestTransaction?.date
                      ? new Date(latestTransaction.date).toLocaleString()
                      : "No receipts yet"}
                </span>
              </li>
            </ul>
            {transactionsError && (
              <div className="mt-4 flex items-center gap-2 rounded-3xl bg-cerise-red-50/80 p-3 text-sm text-cerise-red-700">
                <AlertCircle className="size-4" />
                {transactionsError}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-cerise-red-500">Face evidence</p>
              <h2 className="text-2xl font-semibold text-cerise-red-900">
                Captured identities
              </h2>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
              onClick={() => refetchFaceImages()}
            >
              Refresh faces
            </Button>
          </div>
          {facesError && (
            <div className="mt-4 flex items-center gap-2 rounded-3xl bg-cerise-red-50/80 p-3 text-sm text-cerise-red-700">
              <AlertCircle className="size-4" />
              {facesError}
            </div>
          )}
          <div className="mt-6 min-h-[140px]">
            {facesLoading ? (
              <div className="rounded-3xl border border-dashed border-cerise-red-100 bg-white/70 p-6 text-sm text-cerise-red-500">
                Loading faces...
              </div>
            ) : faceImages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-cerise-red-100 bg-white/70 p-6 text-sm text-cerise-red-500">
                No face images uploaded yet.
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {faceImages.map((face) => (
                  <div
                    key={face.id}
                    className={`min-w-[180px] rounded-3xl border p-4 shadow-[0_12px_30px_rgba(133,30,49,0.08)] ${
                      face.isPrimary
                        ? "border-cerise-red-400 bg-cerise-red-50"
                        : "border-cerise-red-100 bg-white"
                    }`}
                  >
                    {face.imageData ? (
                      <img
                        src={face.imageData}
                        alt="Face capture"
                        className="h-36 w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center rounded-2xl bg-cerise-red-100 text-cerise-red-600">
                        <Images className="size-8" />
                      </div>
                    )}
                    <p className="mt-3 text-sm font-semibold text-cerise-red-900">
                      {face.isPrimary ? "Primary" : "Alternate"}
                    </p>
                    <p className="text-xs text-cerise-red-600">
                      Uploaded {formatDate(face.uploadedAt)}
                    </p>
                    <p className="text-xs text-cerise-red-600">
                      Matches: {face.matchCount ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-cerise-red-500">Biometric identity</p>
              <h2 className="text-2xl font-semibold text-cerise-red-900">
                Latest verified receipt
              </h2>
            </div>
            <Button
              className="rounded-2xl"
              variant="outline"
              onClick={() => refetchTransactions()}
            >
              Sync receipts
            </Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-cerise-red-100 bg-white/80 p-6 text-sm text-cerise-red-600">
              <p className="font-semibold text-cerise-red-900">
                Receipt details
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  Merchant:{" "}
                  <strong>{latestTransaction?.merchantName ?? "--"}</strong>
                </li>
                <li>
                  Wallet:{" "}
                  <strong>{latestTransaction?.walletName ?? "--"}</strong>
                </li>
                <li>
                  Date:{" "}
                  <strong>
                    {latestTransaction?.date
                      ? new Date(latestTransaction.date).toLocaleString()
                      : "--"}
                  </strong>
                </li>
                <li>
                  Match accuracy:{" "}
                  <strong>{faceMatch != null ? `${faceMatch}%` : "--"}</strong>
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-cerise-red-100 bg-white/80 p-6 text-center text-cerise-red-600">
              {biometricImage ? (
                <img
                  src={biometricImage}
                  alt="Latest biometric snapshot"
                  className="mx-auto h-40 w-40 rounded-[28px] object-cover"
                />
              ) : (
                <div className="mx-auto flex size-28 items-center justify-center rounded-[28px] bg-cerise-red-50">
                  <Camera className="size-12 text-cerise-red-500" />
                </div>
              )}
              <p className="mt-4 text-lg font-semibold text-cerise-red-900">
                {snapshotLabel}
              </p>
              <p className="text-sm">
                Stored with AML evidence + liveness record.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-cerise-red-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-cerise-red-50 px-4 py-2">
              <ShieldCheck className="size-4" /> Biometric verified
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-cerise-red-50 px-4 py-2">
              0 compliance alerts
            </span>
          </div>
        </section>

        <section className="rounded-4xl border border-cerise-red-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-cerise-red-500">Receipts timeline</p>
              <h2 className="text-2xl font-semibold text-cerise-red-900">
                All transactions
              </h2>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-cerise-red-200 text-cerise-red-700"
              onClick={() => refetchTransactions()}
            >
              Refresh receipts
            </Button>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-cerise-red-500">
                  <th className="py-3">Receipt</th>
                  <th className="py-3">Merchant</th>
                  <th className="py-3">Wallet</th>
                  <th className="py-3">Date</th>
                  <th className="py-3 text-right">Amount</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactionsLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-sm text-cerise-red-500"
                    >
                      Loading receipts...
                    </td>
                  </tr>
                )}
                {!transactionsLoading && receipts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-sm text-cerise-red-500"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                )}
                {!transactionsLoading &&
                  receipts.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-t border-cerise-red-50 text-cerise-red-900"
                    >
                      <td className="py-4">
                        {txn.snapshotImage ? (
                          <img
                            src={txn.snapshotImage}
                            alt="Receipt snapshot"
                            className="h-12 w-12 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cerise-red-50 text-cerise-red-500">
                            <Camera className="size-4" />
                          </div>
                        )}
                      </td>
                      <td className="font-semibold">{txn.merchantName}</td>
                      <td>{txn.walletName}</td>
                      <td>{formatDate(txn.date)}</td>
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
