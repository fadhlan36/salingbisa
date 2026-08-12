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

const calculateMatch = (
  currentUser: SkillMatch,
  partner: SkillMatch,
): string => {
  const learnMatch = currentUser.learn.filter((skill) =>
    partner.teach.includes(skill),
  );

  const teachMatch = currentUser.teach.filter((skill) =>
    partner.learn.includes(skill),
  );

  const totalSkill = currentUser.learn.length + currentUser.teach.length;

  if (totalSkill === 0) {
    return "0%";
  }

  const matchedSkill = learnMatch.length + teachMatch.length;

  const percentage = Math.round((matchedSkill / totalSkill) * 100);

  return `${percentage}%`;
};

export async function GET(request: NextRequest) {
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  const { data, error } = await supabaseAdmin.rpc("partner_recommendation");

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

  const currentUserSkill = {
    teach: currentUserSkillsData
      .filter((skill) => skill.type === "teach")
      .map((skill) => skill.skill[0]?.name)
      .filter((name): name is string => Boolean(name)),

    learn: currentUserSkillsData
      .filter((skill) => skill.type === "learn")
      .map((skill) => skill.skill[0]?.name)
      .filter((name): name is string => Boolean(name)),
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
    }));

  return NextResponse.json(response);
}
