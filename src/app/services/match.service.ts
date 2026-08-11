import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function getMathces(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("get_matches", {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log("RPC DATA:", JSON.stringify(data, null, 2));
  console.log("RPC TYPE:", typeof data);
  console.log("IS ARRAY:", Array.isArray(data));

  return data;
}
