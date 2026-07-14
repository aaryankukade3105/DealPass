import { supabase } from "../lib/supabase";

export async function getDeals() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function addDeal(deal) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not logged in.");

  const { data, error } = await supabase
    .from("deals")
    .insert([
      {
        ...deal,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateDeal(id, deal) {
  const { data, error } = await supabase
    .from("deals")
    .update(deal)
    .eq("id", id)
    .select()
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