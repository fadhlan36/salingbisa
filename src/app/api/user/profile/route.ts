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
    .select(
      "id, email, full_name, username, location, about_me, bio, user_skills(type, skills(id,name))",
    )
    .eq("id", user?.userId)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const teachSkill = data.user_skills
    .filter((item) => item.type === "teach")
    .map((item) => item.skills);

  const learnSkill = data.user_skills
    .filter((item) => item.type === "learn")
    .map((item) => item.skills);

  const { user_skills, ...userData } = data;

  const response = {
    message: "Berhasil mengambil data my profile",
    data: {
      ...userData,
      skill_teach: teachSkill,
      skill_learn: learnSkill,
    },
  };

  return NextResponse.json(response, { status: 200 });
}
