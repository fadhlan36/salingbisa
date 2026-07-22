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
    .from("skills")
    .select("id, skill_name")
    .neq("user_id", user?.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const skillCounts = data?.reduce(
    (acc, skill) => {
      acc[skill.skill_name] = (acc[skill.skill_name] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const response = data.map((skill) => ({
    id: skill.id,
    skill_name: skill.skill_name,
    skillCount: skillCounts[skill.skill_name],
  }));

  return NextResponse.json(response);
}
