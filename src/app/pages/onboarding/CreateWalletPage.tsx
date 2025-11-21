import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
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
        alert("Error creating wallet");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle>Create Wallet</CardTitle>
            <CardDescription>Set up your first payment wallet.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Wallet Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <Label>Wallet URL (Interledger)</Label>
                    <Input value={formData.wallet_url} onChange={e => setFormData({...formData, wallet_url: e.target.value})} required placeholder="https://..." />
                </div>
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input value={formData.currency_code} onChange={e => setFormData({...formData, currency_code: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <Label>Initial Balance</Label>
                    <Input type="number" value={formData.initial_amount} onChange={e => setFormData({...formData, initial_amount: e.target.value})} />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>Create Wallet</Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
