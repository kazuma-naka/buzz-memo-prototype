import useSWR, { mutate } from "swr";
import { createClient } from "@/lib/client";

const fetchServices = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("title, path")
    .eq("created_user_id", userId);
  if (error) throw new Error(error.message);
  return data;
};

export function useServices(userId: string) {
  return useSWR(userId ? ["services", userId] : null, () =>
    fetchServices(userId)
  );
}

export const deleteService = async (path: string, userId: string) => {
  const supabase = createClient();
  const { error } = await supabase.from("services").delete().eq("path", path);
  if (error) throw new Error(error.message);
  mutate(["services", userId]);
};
