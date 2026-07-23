import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let user;

  try {
    user = verifyToken(token);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, username, location, about_me, bio")
    .eq("id", user?.userId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const response = data.map((item) => ({
    id: item.id,
    email: item.email,
    full_name: item.full_name,
    username: item.username,
    location: item.location,
    about_me: item.about_me,
    bio: item.bio,
  }));

  return NextResponse.json(response);
}
