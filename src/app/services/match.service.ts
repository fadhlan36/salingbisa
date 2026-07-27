import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function getMathces(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("get_matches", {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;

  try {
    return NextResponse.json(
      {
        message: "Berhasil mengambil data matches",
        data,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
