import { useEffect, useState } from "react";
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

const fallbackWallets: WalletRecord[] = [
  {
    id: "wallet-personal",
    name: "Personal Wallet",
    walletUrl: "https://wallets.lookandpay.tech/personal",
    balance: 350.75,
    currency: "EUR",
    isPrimary: true,
    status: "Active",
    updatedAt: "2025-09-18",
  },
  {
    id: "wallet-business",
    name: "Business Wallet",
    walletUrl: "https://wallets.lookandpay.tech/business",
    balance: 93.25,
    currency: "EUR",
    isPrimary: false,
    status: "Active",
    updatedAt: "2025-09-17",
  },
];

export function useWallets() {
  const [wallets, setWallets] = useState<WalletRecord[]>(fallbackWallets);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/wallets");
        if (!res.ok) throw new Error("Failed to fetch wallets");
        const payload = await res.json();
        const normalized: WalletRecord[] = (payload?.wallets || []).map(
          (wallet: any, index: number) => ({
            id:
              wallet.id ??
              (typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `wallet-${index}`),
            name: wallet.name ?? "Wallet",
            walletUrl: wallet.wallet_url ?? wallet.walletUrl ?? "",
            balance:
              typeof wallet.current_balance === "number"
                ? wallet.current_balance
                : Number(wallet.balance ?? 0),
            currency: wallet.currency_code ?? wallet.currency ?? "EUR",
            isPrimary: Boolean(wallet.is_primary ?? wallet.isPrimary),
            status: wallet.status ?? "Active",
            updatedAt: wallet.updated_at ?? wallet.updatedAt,
          }),
        );
        if (normalized.length && mounted) {
          setWallets(normalized);
        }
      } catch (error) {
        console.error("Wallet fetch error", error);
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

  return { wallets, loading };
}
