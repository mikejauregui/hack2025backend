import { fetcher } from "@/fetchet";
import useSWR from "swr";

export default function ConfirmPage({ params }: { params: { id: string } }) {
  // only fetch one time
  const { data, error } = useSWR(`/api/clients/${params.id}/confirm`, fetcher, {
    revalidateOnFocus: false,
  });

  if (error) return <>Error: {error.message}</>;
  if (!data) return <>Loading...</>;

  return <>User {params.id} confirmed!</>;
}
