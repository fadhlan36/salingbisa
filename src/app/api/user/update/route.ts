import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
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
    .from("user_skills")
    .delete()
    .eq("user_id", user?.userId);

  if (errorDeleteSkill) {
    return NextResponse.json(
      { error: errorDeleteSkill.message },
      { status: 500 },
    );
  }

  const allSkillNames = [...teachSkill, ...learnSkill];

  const { data: skillData, error: errorSkillData } = await supabaseAdmin
    .from("skills")
    .select("id, name")
    .in("name", allSkillNames);

  if (errorSkillData) {
    return NextResponse.json(
      { error: errorSkillData.message },
      { status: 500 },
    );
  }

  const skillMap = new Map(skillData.map((skill) => [skill.name, skill.id]));

  const missingSkills = allSkillNames.filter(
    (name: string) => !skillMap.has(name),
  );

  if (missingSkills.length > 0) {
    return NextResponse.json(
      {
        error: "Beberapa skill tidak ditemukan",
        missingSkills,
      },
      { status: 400 },
    );
  }

  const skills = [
    ...(teachSkill ?? []).map((name: string) => ({
      user_id: user?.userId,
      skill_id: skillMap.get(name),
      type: "teach",
    })),
    ...(learnSkill || []).map((name: string) => ({
      user_id: user?.userId,
      skill_id: skillMap.get(name),
      type: "learn",
    })),
  ];

  const { error: errorInsertSkill } = await supabaseAdmin
    .from("user_skills")
    .insert(skills);

  if (errorInsertSkill) {
    return NextResponse.json(
      { error: errorInsertSkill.message },
      { status: 500 },
    );
  }

  const { data: dataSkill, error: errorSkill } = await supabaseAdmin
    .from("user_skills")
    .select("type, skills(id, name)")
    .eq("user_id", user?.userId);

  if (errorSkill) {
    return NextResponse.json({ error: errorSkill.message }, { status: 500 });
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
