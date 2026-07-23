import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  let user;

  try {
    user = verifyToken(token);
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("skill_recommendation")
    .select("*")
    .neq("user_id", user?.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = data.map((skill) => ({
    id: skill.id,
    skill_name: skill.name,
    skillCount: skill.total_people,
  }));

  return NextResponse.json(response);
}
