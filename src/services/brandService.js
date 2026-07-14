import { supabase } from "../lib/supabase";

export async function getBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function addBrand(brand) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("brands")
    .insert({
      user_id: user.id,

      brand_name: brand.brand_name,

      poc_name: brand.poc_name,

      email: brand.email,

      phone: brand.phone,

      instagram: brand.instagram,

      website: brand.website,

      notes: brand.notes,
    })
    .select();

  if (error) throw error;

  return data;
}

export async function updateBrand(id, brand) {
  const { data, error } = await supabase
    .from("brands")
    .update(brand)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}

export async function deleteBrand(id) {
  const { error } = await supabase
    .from("brands")
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    })
    .eq("id", id);

  if (error) throw error;
}