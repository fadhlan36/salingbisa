import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    verifyToken(token);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;

  if (!username) {
    return NextResponse.json({ message: "Invalid username" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, full_name, username, location, about_me, bio, user_skills(type, skills(id,name))",
    )
    .eq("username", username)
    .single();

  if (error?.code === "PGRST116") {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

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

  return NextResponse.json(
    {
      message: "Berhasil mengambil data profile",
      data: { ...userData, skill_teach: teachSkill, skill_learn: learnSkill },
    },
    {
      status: 200,
    },
  );
}
