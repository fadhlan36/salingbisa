import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  const { data, error } = await supabaseAdmin.from("skills").select("id,name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Berhasil mengambil data skills", data },
    { status: 200 },
  );
}
