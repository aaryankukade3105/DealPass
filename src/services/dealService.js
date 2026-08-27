import { supabase } from "../lib/supabase";

// Columns we actually need back from the server after a write. We
// deliberately avoid `.select("*")`: the client already has every field
// it sent (optimistic update), so the only things worth round-tripping
// are server-generated/derived columns. Keeping this list short reduces
// response payload size and Postgres serialization work on every save.
const RETURN_COLUMNS = "id, created_at, updated_at";

export async function getDeals() {
  const {
    data: { session },
  } = await supabase.auth.getSession(); // local, no network call

  const user = session?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function addDeal(deal, userId) {
  if (!userId) throw new Error("User not logged in.");

  const { data, error } = await supabase
    .from("deals")
    .insert([
      {
        ...deal,
        user_id: userId,
      },
    ])
    .select(RETURN_COLUMNS)
    .single();

  if (error) throw error;

  return data;
}

export async function updateDeal(id, deal) {
  const { data, error } = await supabase
    .from("deals")
    .update(deal)
    .eq("id", id)
    .select(RETURN_COLUMNS)
    .single();

  if (error) throw error;

  return data;
}

export async function deleteDeal(id) {
  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id);

  if (error) throw error;
}