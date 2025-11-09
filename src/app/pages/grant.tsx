import GrantForm from "@/components/grantFormt";

export default function GrantPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-8">
      <h1
        className="text-3xl font-bold mb-6
      "
      >
        Grant Page
      </h1>
      <GrantForm clientId={params.id} />
    </div>
  );
}
