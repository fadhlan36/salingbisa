import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { calculateMatch } from "../recomendation/route";

type SkillMatch = {
  teach: string[];
  learn: string[];
};

type Partner = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  skill_teach: string[];
  skill_learn: string[];
};

type CurrentUserSkillData = {
  type: "teach" | "learn";
  skill: {
    name: string;
  };
};

export async function GET(request: NextRequest) {
  // =========================
  // 1. Authentication
  // =========================

  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  // =========================
  // 2. Pagination
  // =========================

  const { searchParams } = new URL(request.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const limit = Math.min(Number(searchParams.get("limit")) || 10, 10);

  // =========================
  // 3. Get current user skills
  // =========================

  const { data: currentUserSkillsData, error: currentUserSkillsError } =
    await supabaseAdmin
      .from("user_skills")
      .select(
        `
      type,
      skill:skills(
        name
      )
    `,
      )
      .eq("user_id", user!.userId);

  if (currentUserSkillsError) {
    return NextResponse.json(
      {
        message: currentUserSkillsError.message,
      },
      { status: 500 },
    );
  }

  const currentUserSkills =
    currentUserSkillsData as unknown as CurrentUserSkillData[];

  const currentUserSkill: SkillMatch = {
    teach: currentUserSkills
      .filter((skill) => skill.type === "teach")
      .map((skill) => skill.skill.name),

    learn: currentUserSkills
      .filter((skill) => skill.type === "learn")
      .map((skill) => skill.skill.name),
  };

  // =========================
  // 4. Get partners
  // =========================

  const { data: partnersData, error: partnersError } = await supabaseAdmin
    .from("partner_view")
    .select(
      `
      id,
      username,
      full_name,
      avatar_url,
      skill_teach,
      skill_learn
    `,
    )
    .neq("id", user!.userId);

  if (partnersError) {
    return NextResponse.json(
      {
        message: partnersError.message,
      },
      { status: 500 },
    );
  }

  const partners = (partnersData ?? []) as Partner[];

  // =========================
  // 5. Calculate match
  // =========================

  const partnersWithMatch = partners.map((partner) => {
    const match = calculateMatch(currentUserSkill, {
      teach: partner.skill_teach,
      learn: partner.skill_learn,
    });

    return {
      id: partner.id,
      avatar_url: partner.avatar_url,
      full_name: partner.full_name,
      skill_teach: partner.skill_teach,
      skill_learn: partner.skill_learn,
      match,
    };
  });

  // =========================
  // 6. Sort by match
  // =========================

  partnersWithMatch.sort(
    (a, b) => Number.parseInt(b.match) - Number.parseInt(a.match),
  );

  // =========================
  // 7. Pagination
  // =========================

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedPartners = partnersWithMatch.slice(start, end);

  const hasMore = end < partnersWithMatch.length;

  // =========================
  // 8. Response
  // =========================

  return NextResponse.json(
    {
      message: "Berhasil mengambil data partner",
      data: paginatedPartners,
      pagination: {
        page,
        limit,
        hasMore,
      },
    },
    { status: 200 },
  );
}
