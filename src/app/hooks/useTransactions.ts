import { useEffect, useMemo, useState } from "react";
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
}

const fallbackTransactions: TransactionRecord[] = [
  {
    id: "txn-001",
    merchantName: "Kafeteria",
    amount: -5.5,
    currency: "EUR",
    status: "failed",
    date: "2025-09-19",
    walletName: "Personal Wallet",
    paymentType: "outgoing",
    faceMatch: 86.5,
  },
  {
    id: "txn-002",
    merchantName: "Comms",
    amount: -18.25,
    currency: "EUR",
    status: "completed",
    date: "2025-09-18",
    walletName: "Business Wallet",
    paymentType: "outgoing",
    faceMatch: 92.1,
  },
  {
    id: "txn-003",
    merchantName: "FreshMart",
    amount: -12.95,
    currency: "EUR",
    status: "completed",
    date: "2025-09-16",
    walletName: "Personal Wallet",
    paymentType: "outgoing",
    faceMatch: 88.0,
  },
];

export function useTransactions() {
  const [transactions, setTransactions] =
    useState<TransactionRecord[]>(fallbackTransactions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const payload = await res.json();
        const normalized: TransactionRecord[] = (payload || []).map(
          (txn: any, index: number) => ({
            id: txn.id ?? `txn-${index}`,
            merchantName:
              txn.merchant_name ||
              txn.store_name ||
              txn.metadata?.merchant_name ||
              `Merchant ${index + 1}`,
            amount:
              typeof txn.amount === "number"
                ? txn.amount
                : Number(txn.amount ?? 0),
            currency: txn.currency ?? txn.currency_code ?? "EUR",
            status: (
              txn.payment_status ??
              txn.status ??
              "completed"
            ).toLowerCase(),
            date: txn.created_at ?? txn.timestamp ?? new Date().toISOString(),
            walletName:
              txn.wallet_name ?? txn.wallet?.name ?? "Personal Wallet",
            paymentType: txn.payment_type ?? "outgoing",
            faceMatch:
              typeof txn.face_match_confidence === "number"
                ? txn.face_match_confidence
                : txn.metadata?.face_match,
          }),
        );
        if (normalized.length && mounted) {
          setTransactions(normalized);
        }
      } catch (error) {
        console.error("Transaction fetch error", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const outgoing = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      outgoing,
      count: transactions.length,
    };
  }, [transactions]);

  return { transactions, loading, totals };
}
