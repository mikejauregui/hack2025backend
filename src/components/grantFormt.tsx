import { useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
    console.log("Grant response:", data);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label>
        Client ID:
        <Input type="text" name="client_id" defaultValue={1} />
      </label>
      <label>
        Amount:
        <Input type="number" name="amount" />
      </label>
      <Button type="submit">Create Grant</Button>
    </form>
  );
}
