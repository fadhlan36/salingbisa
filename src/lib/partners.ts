import { supabaseAdmin } from "@/lib/supabase/admin";

export type PartnerRecommendationItem = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  teachSkill: string[];
  learnSkill: string[];
  match: string; // contoh: "83%"
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

type RawPartnerRow = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  teach: string[];
  learn: string[];
};

export function calculateMatch(
  currentUser: SkillMatch,
  partner: SkillMatch,
): string {
  const learningMatches = currentUser.learn.filter((skill) =>
    partner.teach.includes(skill),
  );

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

/**
 * Mengambil rekomendasi partner untuk seorang user, lengkap dengan skor match.
 * Dipakai langsung oleh Server Component (Dashboard) maupun oleh API route
 * /api/partner/recomendation — logic query & perhitungan match hanya ada
 * di satu tempat ini.
 */
export async function getPartnerRecommendations(
  userId: string,
): Promise<PartnerRecommendationItem[]> {
  const { data, error } = await supabaseAdmin.rpc("partner_recommendation", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching partner_recommendation RPC:", error);
    return [];
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
      .eq("user_id", userId);

  if (errorCurrentUser) {
    console.error("Error fetching current user skills:", errorCurrentUser);
    return [];
  }

  const currentUserSkillData =
    currentUserSkillsData as unknown as CurrentUserSkillData[];

  const currentUserSkill: SkillMatch = {
    teach: currentUserSkillData
      .filter((skill) => skill.type === "teach")
      .map((skill) => skill.skill.name),
    learn: currentUserSkillData
      .filter((skill) => skill.type === "learn")
      .map((skill) => skill.skill.name),
  };

  return (data as RawPartnerRow[])
    .filter((partner) => partner.id !== userId)
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
}
