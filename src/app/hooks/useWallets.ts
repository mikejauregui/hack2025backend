import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

export interface WalletRecord {
  id: string;
  name: string;
  walletUrl: string;
  balance: number;
  currency: string;
  isPrimary: boolean;
  status: string;
  updatedAt?: string;
}

export function useWallets() {
  const { token } = useAuth();
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (!token) {
      setWallets([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchWallets() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/wallets");
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load wallets");
        }
        if (!cancelled) {
          const normalized: WalletRecord[] = Array.isArray(payload?.wallets)
            ? payload.wallets.map((wallet: any, index: number) => ({
                id:
                  wallet.id ??
                  (typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `wallet-${index}`),
                name: wallet.name ?? "Wallet",
                walletUrl: wallet.wallet_url ?? wallet.walletUrl ?? "",
                balance: (() => {
                  const value =
                    wallet.current_balance ??
                    wallet.balance ??
                    wallet.initial_amount ??
                    0;
                  return typeof value === "number" ? value : Number(value) || 0;
                })(),
                currency: wallet.currency_code ?? wallet.currency ?? "EUR",
                isPrimary: Boolean(wallet.is_primary ?? wallet.isPrimary),
                status: wallet.status ?? "Active",
                updatedAt: wallet.updated_at ?? wallet.updatedAt ?? undefined,
              }))
            : [];
          setWallets(normalized);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Wallet fetch error", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load wallets",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWallets();

    return () => {
      cancelled = true;
    };
  }, [token, refreshIndex]);

  const refetch = () => setRefreshIndex((index) => index + 1);

  return { wallets, loading, error, refetch };
}
