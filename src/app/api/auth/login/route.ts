import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, email, password_hash, full_name")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 },
    );
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 },
    );
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    full_name: user.full_name,
  });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, full_name: user.full_name },
  });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
