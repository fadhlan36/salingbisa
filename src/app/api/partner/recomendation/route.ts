import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type PartnerRecommendation = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  teach: string[];
  learn: string[];
};

type SkillMatch = {
  teach: string[];
  learn: string[];
};

type CurrentUserSkillData = {
  type: "teach" | "learn";
  skill: {
    name: string;
  };
};

export function calculateMatch(
  currentUser: SkillMatch,
  partner: SkillMatch,
): string {
  // Apa yang ingin dipelajari user dan bisa diajarkan partner
  const learningMatches = currentUser.learn.filter((skill) =>
    partner.teach.includes(skill),
  );

  // Apa yang ingin dipelajari partner dan bisa diajarkan user
  const teachingMatches = partner.learn.filter((skill) =>
    currentUser.teach.includes(skill),
  );

  const learningScore =
    currentUser.learn.length > 0
      ? learningMatches.length / currentUser.learn.length
      : 0;

  const teachingScore =
    partner.learn.length > 0
      ? teachingMatches.length / partner.learn.length
      : 0;

  const matchPercentage = Math.round(
    ((learningScore + teachingScore) / 2) * 100,
  );

  return `${matchPercentage}%`;
}

export async function GET(request: NextRequest) {
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  const { data, error } = await supabaseAdmin.rpc("partner_recommendation", {
    p_user_id: user!.userId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: currentUserSkillsData, error: errorCurrentUser } =
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

  if (errorCurrentUser) {
    return NextResponse.json(
      { message: errorCurrentUser.message },
      { status: 500 },
    );
  }

  const currentUserSkillData =
    currentUserSkillsData as unknown as CurrentUserSkillData[];

  const currentUserSkill = {
    teach: currentUserSkillData
      .filter((skill) => skill.type === "teach")
      .map((skill) => skill.skill.name),

    learn: currentUserSkillData
      .filter((skill) => skill.type === "learn")
      .map((skill) => skill.skill.name),
  };

  const response = (data as PartnerRecommendation[])
    .filter((partner) => partner.id !== user?.userId)
    .map((partner) => ({
      id: partner.id,
      avatar_url: partner.avatar_url,
      full_name: partner.full_name,
      username: partner.username,
      teachSkill: partner.teach,
      learnSkill: partner.learn,
      match: calculateMatch(currentUserSkill, {
        teach: partner.teach,
        learn: partner.learn,
      }),
    }))
    .sort((a, b) => Number.parseInt(b.match) - Number.parseInt(a.match))
    .slice(0, 10);

  return NextResponse.json(response);
}
