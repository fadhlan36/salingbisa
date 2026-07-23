import HorizontalScroll from "@/components/common/horizontal-scroll";
import PartnerCard from "@/components/dashboard/partner-card";
import SkillCard from "@/components/dashboard/skill-card";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Interface untuk data Partner dari API
interface PartnerApiResponse {
  id: string;
  avatar_url: string | null;
  full_name: string;
  skill_teach: { name: string }[] | string[];
  skill_learn: { name: string }[] | string[];
  match: string; // "100%"
}

// Interface untuk data Skill dari API
interface SkillApiResponse {
  id: string;
  skill_name: string;
  skillCount: number;
}

// Helper untuk mapping icon berdasarkan nama skill (opsional)
const getSkillIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("design") || lower.includes("ui")) return "🎨";
  if (
    lower.includes("js") ||
    lower.includes("javascript") ||
    lower.includes("code")
  )
    return "💻";
  if (lower.includes("python")) return "🐍";
  if (lower.includes("market")) return "📈";
  if (lower.includes("sale")) return "💼";
  return "💡";
};

// Fetch Rekomendasi Partner
async function getPartnerRecommendations(token: string) {
  try {
    const res = await fetch("http://localhost:3000/api/partner/recomendation", {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch partner recommendations:", res.statusText);
      return [];
    }

    const data: PartnerApiResponse[] = await res.json();

    return data.map((item) => {
      const numericMatch = parseInt(item.match.replace("%", ""), 10) || 0;

      const teachSkill =
        item.skill_teach.length > 0
          ? typeof item.skill_teach[0] === "string"
            ? item.skill_teach[0]
            : item.skill_teach[0].name
          : "Not specified";

      const learnSkill =
        item.skill_learn.length > 0
          ? typeof item.skill_learn[0] === "string"
            ? item.skill_learn[0]
            : item.skill_learn[0].name
          : "Not specified";

      return {
        id: item.id,
        name: item.full_name,
        avatar: item.avatar_url || "/profile.jpg",
        match: numericMatch,
        teach: teachSkill,
        learn: learnSkill,
      };
    });
  } catch (error) {
    console.error("Error fetching partner recommendations:", error);
    return [];
  }
}

// Fetch Rekomendasi Skill
async function getSkillRecommendations(token: string) {
  try {
    const res = await fetch("http://localhost:3000/api/skill/recomendation", {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch skill recommendations:", res.statusText);
      return [];
    }

    const data: SkillApiResponse[] = await res.json();

    return data.map((item) => ({
      id: item.id,
      name: item.skill_name,
      amountPeople: item.skillCount,
      icon: getSkillIcon(item.skill_name),
    }));
  } catch (error) {
    console.error("Error fetching skill recommendations:", error);
    return [];
  }
}

export default async function Dashboard() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let payload;
  try {
    payload = verifyToken(token); // { userId, email, full_name }
  } catch {
    redirect("/auth/login");
  }

  // Fetch kedua data secara parallel
  const [partners, skills] = await Promise.all([
    getPartnerRecommendations(token),
    getSkillRecommendations(token),
  ]);

  return (
    <section className="mx-auto max-w-7xl space-y-8 pt-20 pb-10 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Hai, {payload?.full_name ? payload?.full_name : "there"} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          Find learning partners and grow together.
        </p>
      </div>

      {/* Rekomendation Match */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {/* Left side */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">Top Picks For You</h3>
            <p className="text-sm text-muted-foreground">
              People who want to learn what you teach, and can teach what you
              want to learn.
            </p>
          </div>
          {/* Right side */}
          <div>
            <p className="text-md text-indigo-600 font-bold cursor-pointer hover:text-indigo-700 transition-all duration-200">
              See All
            </p>
          </div>
        </div>

        {/* Partner Cards */}
        <div className="flex flex-col gap-4">
          {partners.length > 0 ? (
            <HorizontalScroll>
              {partners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </HorizontalScroll>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">
              Belum ada rekomendasi partner yang ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* Browse Available Skills */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <h3 className="text-xl font-semibold">Browse by Skills</h3>

        {/* Skill Cards */}
        <div className="flex flex-col gap-4">
          {skills.length > 0 ? (
            <HorizontalScroll>
              {skills.map((skill) => (
                <SkillCard key={skill.id || skill.name} skill={skill} />
              ))}
            </HorizontalScroll>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">
              Belum ada rekomendasi skill yang tersedia.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
