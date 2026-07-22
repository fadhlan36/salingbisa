import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verify } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let user;

  try {
    user = verifyToken(token);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  //   let user = { userId: "24eccc46-3ce4-4d1d-a2bd-fa34b15f0ed6" };

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, username, avatar_url, skills(id, skill_name, type)")
    .neq("id", user?.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const recomendation = data.map((item) => ({
    id: item.id,
    avatar_url: item.avatar_url,
    full_name: item.full_name,
    skill_teach: item.skills.filter((skill) => {
      skill.type === "teach";
    }),
    skill_learn: item.skills.filter((skill) => {
      skill.type === "learn";
    }),
    match: "100%",
  }));

  return NextResponse.json(recomendation);
}
