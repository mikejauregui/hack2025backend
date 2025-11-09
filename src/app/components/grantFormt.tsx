import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function GrantForm() {
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const client_id = formData.get("client_id") as string;
    const amount = formData.get("amount") as string;

    const response = await fetch("/api/grant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ client_id, amount: Number(amount) }),
    });

    const data = await response.json();
    const uri = data?.outgoingPaymentGrant?.interact?.redirect;

    if (uri) {
      window.location.href = uri;
    }

    console.log("Grant response:", data);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Label>Client ID:</Label>
      <Input
        type="text"
        name="client_id"
        defaultValue={"b3b1d743-564d-46b1-89f4-2543399f4055"}
      />
      <Label>Amount:</Label>
      <Input type="number" name="amount" />
      <Button type="submit">Create Grant</Button>
    </form>
  );
}
