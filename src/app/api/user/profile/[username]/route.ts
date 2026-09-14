import { verifyToken } from "@/lib/auth";
import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  const { username } = await params;

  if (!username) {
    return NextResponse.json({ message: "Invalid username" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, full_name, username, location, about_me, bio, avatar_url, user_skills(type, skills(id,name))",
    )
    .eq("username", username)
    .single();

  if (error?.code === "PGRST116") {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  let matchStatus: "none" | "pending" | "accepted" = "none";
  let isSender = false;
  let matchId: string | null = null;

  // Cek relasi match antara user login dan target user jika user melihat dirinya sendiri skip ini
  if (data!.id !== user!.userId) {
    const { data: match, error: matchError } = await supabaseAdmin
      .from("matches")
      .select("id, status, user_a_id")
      .or(
        `and(user_a_id.eq.${user!.userId},user_b_id.eq.${data.id}),and(user_a_id.eq.${data.id},user_b_id.eq.${user!.userId})`,
      )
      .maybeSingle();

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    if (match) {
      matchStatus = match.status === "accepted" ? "accepted" : "pending";
      matchId = match.id;
      isSender = match.user_a_id === user!.userId;
    }
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
      data: {
        ...userData,
        skill_teach: teachSkill,
        skill_learn: learnSkill,
        match_status: matchStatus,
        is_sender: isSender,
        match_id: matchId,
      },
    },
    {
      status: 200,
    },
  );
}
