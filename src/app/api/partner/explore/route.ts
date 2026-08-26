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
  teach: string[];
  learn: string[];
};

type CurrentUserSkillData = {
  type: "teach" | "learn";
  skill: {
    name: string;
  };
};

export async function GET(request: NextRequest) {
  // Auth
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  // Pagination
  const { searchParams } = new URL(request.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const limit = Math.min(Number(searchParams.get("limit")) || 10, 10);

  // Current user skills
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

  // Existing matches
  const { data: matches, error: matchError } = await supabaseAdmin
    .from("matches")
    .select("user_a_id, user_b_id")
    .or(`user_a_id.eq.${user!.userId},user_b_id.eq.${user!.userId}`);

  if (matchError) {
    return NextResponse.json(
      {
        message: matchError.message,
      },
      { status: 500 },
    );
  }

  const matchedUserIds =
    matches?.map((match) =>
      match.user_a_id === user!.userId ? match.user_b_id : match.user_a_id,
    ) ?? [];

  // Partners
  let partnersQuery = supabaseAdmin
    .from("partner_view")
    .select(
      `
      id,
      username,
      full_name,
      avatar_url,
      teach,
      learn
    `,
    )
    .neq("id", user!.userId);

  if (matchedUserIds.length > 0) {
    partnersQuery = partnersQuery.not(
      "id",
      "in",
      `(${matchedUserIds.join(",")})`,
    );
  }

  const { data: partnersData, error: partnersError } = await partnersQuery;

  if (partnersError) {
    return NextResponse.json(
      {
        message: partnersError.message,
      },
      { status: 500 },
    );
  }

  const partners = (partnersData ?? []) as Partner[];

  // Calculate match
  const partnersWithMatch = partners.map((partner) => ({
    id: partner.id,
    avatar_url: partner.avatar_url,
    full_name: partner.full_name,
    skill_teach: partner.teach,
    skill_learn: partner.learn,
    match: calculateMatch(currentUserSkill, {
      teach: partner.teach,
      learn: partner.learn,
    }),
  }));

  // Sort
  partnersWithMatch.sort(
    (a, b) => Number.parseInt(b.match) - Number.parseInt(a.match),
  );

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedPartners = partnersWithMatch.slice(start, end);

  const hasMore = end < partnersWithMatch.length;

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
