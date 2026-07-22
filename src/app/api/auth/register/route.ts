import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password, fullName } = await request.json();

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter" },
      { status: 400 },
    );
  }

  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: newUser, error } = await supabaseAdmin
    .from("users")
    .insert({ email, password_hash: passwordHash, full_name: fullName })
    .select("id, email, full_name")
    .single();

  if (error || !newUser) {
    console.log(error);
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }

  const token = signToken({ userId: newUser.id, email: newUser.email, full_name: newUser.full_name });

  const response = NextResponse.json({ user: newUser });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
