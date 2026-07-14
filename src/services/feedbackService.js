import { supabase } from "../lib/supabase";

export async function submitFeedback({
  type,
  title,
  message,
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not logged in.");
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert([
      {
        user_id: user.id,
        type,
        title,
        message,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}