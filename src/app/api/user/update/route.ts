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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    full_name,
    email,
    username,
    location,
    about_me,
    bio,
    teachSkill,
    learnSkill,
  } = body;

  if (!full_name || !email || !username) {
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 },
    );
  }

  const { data: dataUser, error: errorUser } = await supabaseAdmin
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
    .select("full_name, email, username, location, about_me, bio")
    .single();

  if (errorUser) {
    return NextResponse.json({ error: errorUser.message });
  }

  const { error: errorDeleteSkill } = await supabaseAdmin
    .from("skills")
    .delete()
    .eq("user_id", user?.userId);

  if (errorDeleteSkill) {
    return NextResponse.json({ error: errorDeleteSkill.message });
  }

  const skills = [
    ...(teachSkill || []).map((skill: string) => ({
      user_id: user?.userId,
      skill_name: skill,
      type: "teach",
    })),
    ...(learnSkill || []).map((skill: string) => ({
      user_id: user?.userId,
      skill_name: skill,
      type: "learn",
    })),
  ];

  const { data: dataSkill, error: errorSkill } = await supabaseAdmin
    .from("skills")
    .insert(skills)
    .select("skill_name, type");

  if (errorSkill) {
    return NextResponse.json({ error: errorSkill.message });
  }

  const data = {
    full_name: dataUser.full_name,
    email: dataUser.email,
    username: dataUser.username,
    location: dataUser.location,
    about_me: dataUser.about_me,
    bio: dataUser.bio,
    skill_teach: dataSkill.filter((skill) => skill.type == "teach"),
    skill_learn: dataSkill.filter((skill) => skill.type == "learn"),
  };

  const response = { message: "Profile sudah terupdate", data };

  return NextResponse.json({ response }, { status: 200 });
}
