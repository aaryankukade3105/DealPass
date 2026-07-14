import { supabase } from "./lib/supabase";

export async function testConnection() {
  const { data, error } = await supabase.auth.getSession();

  console.log("Session:", data);
  console.log("Error:", error);
}