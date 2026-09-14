import { supabaseAdmin } from "@/lib/supabase/admin";

export type SkillRecommendationItem = {
  id: string;
  skill_name: string;
  skillCount: number;
};

export async function getSkillRecommendations(
  userId: string,
): Promise<SkillRecommendationItem[]> {
  const { data, error } = await supabaseAdmin
    .from("skill_recommendation")
    .select("*")
    .neq("user_id", userId);

  if (error) {
    console.error("Error fetching skill_recommendation:", error);
    return [];
  }

  const skillMap = new Map<string, SkillRecommendationItem>();

  for (const skill of data) {
    const existing = skillMap.get(skill.name);

    if (existing) {
      existing.skillCount += skill.total_people ?? 0;
    } else {
      skillMap.set(skill.name, {
        id: skill.id,
        skill_name: skill.name,
        skillCount: skill.total_people ?? 0,
      });
    }
  }

  return Array.from(skillMap.values());
}
