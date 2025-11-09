import { fetcher } from "@/fetchet";
import useSWR from "swr";
import { Link } from "wouter";

export function ListOfClients() {
  const { data, error } = useSWR("/api/clients", fetcher);

  if (error) return <div>Failed to load clients</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <ul className="list-disc pl-5">
        {data.map((client: any) => (
          <li key={client.id} className="mb-2">
            <Link href={`/clients/${client.id}`}>{client.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
