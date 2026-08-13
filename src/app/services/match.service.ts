import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getMathces(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("get_matches", {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
