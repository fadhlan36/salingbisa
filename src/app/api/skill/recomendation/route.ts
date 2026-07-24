import { verifyToken } from "@/lib/auth";
import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
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
