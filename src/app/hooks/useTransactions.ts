import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

export interface TransactionRecord {
  id: string;
  merchantName: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  walletName: string;
  paymentType: string;
  faceMatch?: number | null;
  walletId?: string | null;
  snapshotKey?: string | null;
  voiceKey?: string | null;
  interledgerPaymentId?: string | null;
  snapshotImage?: string | null;
}

export function useTransactions() {
  const { token, user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (!token) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/transactions", {
          signal: controller.signal,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load transactions");
        }

        if (cancelled) return;

        const source = Array.isArray(payload?.transactions)
          ? payload.transactions
          : Array.isArray(payload)
            ? payload
            : [];

        const normalized: TransactionRecord[] = source
          .filter((txn: any) => (user?.id ? txn.user_id === user.id : true))
          .map((txn: any, index: number) => {
            const metadata =
              typeof txn.metadata === "string"
                ? (() => {
                    try {
                      return JSON.parse(txn.metadata);
                    } catch {
                      return null;
                    }
                  })()
                : txn.metadata;

            return {
              id: txn.id ?? `txn-${index}`,
              merchantName:
                txn.merchant_name ||
                txn.store_name ||
                metadata?.merchant_name ||
                `Merchant ${index + 1}`,
              amount:
                typeof txn.amount === "number"
                  ? txn.amount
                  : Number(txn.amount ?? 0),
              currency: txn.currency ?? txn.currency_code ?? "EUR",
              status: String(
                txn.payment_status ?? txn.status ?? "completed",
              ).toLowerCase(),
              date:
                txn.created_at ||
                txn.completed_at ||
                txn.timestamp ||
                new Date().toISOString(),
              walletName:
                txn.wallet?.name ||
                txn.wallet_name ||
                metadata?.wallet_name ||
                "Wallet",
              walletId: txn.wallet_id || txn.wallet?.id || null,
              paymentType: txn.payment_type ?? "outgoing",
              faceMatch:
                txn.face_match_confidence != null
                  ? Number(txn.face_match_confidence)
                  : (metadata?.face_match ?? null),
              snapshotKey: txn.snapshot_s3_key || txn.snapshot || null,
              snapshotImage:
                txn.snapshot_image ||
                txn.snapshotImage ||
                (typeof txn.snapshot === "string" &&
                txn.snapshot.startsWith("data:")
                  ? txn.snapshot
                  : null),
              voiceKey: txn.voice_s3_key || null,
              interledgerPaymentId: txn.interledger_payment_id || null,
            };
          });

        setTransactions(normalized);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Transaction fetch error", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load transactions",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTransactions();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [token, user?.id, refreshIndex]);

  const totals = useMemo(() => {
    const outgoing = transactions
      .filter((t) => typeof t.amount === "number" && t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      outgoing,
      count: transactions.length,
    };
  }, [transactions]);

  const refetch = () => setRefreshIndex((index) => index + 1);

  return { transactions, loading, error, totals, refetch };
}
