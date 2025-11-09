import { ListOfClients } from "@/components/ListOfClients";

export default function HomePage() {
  return (
    <div className="container mx-auto p-8">
      <h1
        className="text-3xl font-bold mb-6
      "
      >
        Home
      </h1>
      <ListOfClients />
    </div>
  );
}
