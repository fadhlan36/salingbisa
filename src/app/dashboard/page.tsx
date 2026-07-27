import HorizontalScroll from "@/components/common/horizontal-scroll";
import PartnerCard from "@/components/dashboard/partner-card";
import SkillCard from "@/components/dashboard/skill-card";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Interface fleksibel untuk data Partner dari API
interface PartnerApiResponse {
  id: string;
  avatar_url: string | null;
  full_name: string;
  teachSkill?: any;
  skill_teach?: any;
  learnSkill?: any;
  skill_learn?: any;
  match?: string; // "100%"
}

// Interface untuk data Skill dari API
interface SkillApiResponse {
  id: string;
  skill_name: string;
  skillCount: number;
}

// Helper untuk mengekstrak SEMUA nama skill menjadi Array of String []
function parseSkillList(skillsInput: any): string[] {
  if (!skillsInput) return [];

  let parsedSkills = skillsInput;

  // 1. Jika data berupa string JSON, parse dulu
  if (typeof skillsInput === "string") {
    try {
      parsedSkills = JSON.parse(skillsInput);
    } catch {
      // Jika string murni bukan JSON
      return skillsInput.trim() !== "" ? [skillsInput] : [];
    }
  }

  // 2. Jika berbentuk Array
  if (Array.isArray(parsedSkills)) {
    return parsedSkills
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          return (
            item.name ||
            item.skill_name ||
            item.title ||
            item.name_skill ||
            item.skill ||
            ""
          );
        }
        return "";
      })
      .filter((name) => Boolean(name && name.trim() !== ""));
  }

  // 3. Jika berbentuk Object tunggal (bukan array)
  if (typeof parsedSkills === "object" && parsedSkills !== null) {
    const name =
      parsedSkills.name ||
      parsedSkills.skill_name ||
      parsedSkills.title ||
      parsedSkills.name_skill ||
      parsedSkills.skill ||
      "";
    return name ? [String(name)] : [];
  }

  return [];
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
      const numericMatch =
        parseInt(item.match?.replace("%", "") || "0", 10) || 0;

      // Mendapatkan array berisi semua skill (misal: ["Laravel", "UI/UX", "React"])
      const teachSkills = parseSkillList(item.teachSkill || item.skill_teach);
      const learnSkills = parseSkillList(item.learnSkill || item.skill_learn);

      return {
        id: item.id,
        name: item.full_name,
        avatar: item.avatar_url || "/profile.jpg",
        match: numericMatch,
        teach: teachSkills, // Mengembalikan string[]
        learn: learnSkills, // Mengembalikan string[]
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

    // Saring data agar tidak ada ID skill yang sama (Mencegah Duplicate Key Error)
    const uniqueSkills = data.filter(
      (item, index, self) => self.findIndex((s) => s.id === item.id) === index,
    );

    return uniqueSkills.map((item) => ({
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

      {/* Recommendation Match */}
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
              {skills.map((skill, index) => (
                <SkillCard key={`${skill.id}-${index}`} skill={skill} />
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
