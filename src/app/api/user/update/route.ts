import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user;

  try {
    user = verifyToken(token);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { full_name, email, username, location, about_me, bio } = body;

  if (!full_name || !email || !username) {
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({
      full_name,
      email,
      username,
      location,
      about_me,
      bio,
    })
    .eq("id", user?.userId)
    .select("full_name, email, username, location, abaout_me, bio")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  const response = { message: "Profile sudah terupdate", data };

  return NextResponse.json({ response }, { status: 200 });
}
