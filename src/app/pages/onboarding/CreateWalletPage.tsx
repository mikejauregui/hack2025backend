import { useState } from "react";
import { WalletMinimal } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { api } from "../../lib/api";

export default function CreateWalletPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: "Personal Wallet",
      wallet_url: "",
      currency_code: "EUR",
      initial_amount: "0"
  });
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await api.post("/wallets", {
            ...formData,
            initial_amount: parseFloat(formData.initial_amount),
            is_primary: true
        });
        if (res.ok) {
            navigate("/dashboard");
        } else {
            alert("Failed to create wallet");
        }
    } catch (e) {
        console.error("Create wallet error", e);
        alert("Error creating wallet");
    } finally {
        setLoading(false);
    }
  };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
            <Card className="mx-auto w-full max-w-4xl rounded-4xl border-cerise-red-100 bg-white/90 p-10 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
                <header className="mb-8 flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cerise-red-400">
                        Step 3 of 4
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="flex size-12 items-center justify-center rounded-3xl bg-cerise-red-50 text-cerise-red-600">
                            <WalletMinimal className="size-6" />
                        </span>
                        <div>
                            <h1 className="text-3xl font-semibold text-cerise-red-900">Create your first wallet</h1>
                            <p className="text-sm text-cerise-red-600">Primary wallet funds face-based payments and can be renamed later.</p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-cerise-red-900">Wallet name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cerise-red-900">Wallet URL (Interledger)</Label>
                            <Input
                                value={formData.wallet_url}
                                onChange={(e) => setFormData({ ...formData, wallet_url: e.target.value })}
                                required
                                placeholder="https://wallets.lookandpay.tech/jane"
                                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-cerise-red-900">Currency</Label>
                            <Input
                                value={formData.currency_code}
                                onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                                required
                                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cerise-red-900">Initial balance</Label>
                            <Input
                                type="number"
                                value={formData.initial_amount}
                                onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                                className="h-11 rounded-2xl border-cerise-red-100 bg-cerise-red-50/40"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-dashed border-cerise-red-100 bg-cerise-red-50/80 p-6 text-sm text-cerise-red-700">
                            <p className="font-semibold text-cerise-red-900">Info</p>
                            <p>
                                This will be your primary wallet. You can connect additional wallets later for business or savings use-cases.
                            </p>
                        </div>
                        <Button type="submit" className="mt-6 w-full rounded-2xl py-6 text-base font-semibold" disabled={loading}>
                            {loading ? "Creating..." : "Finish setup"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
