import HorizontalScroll from "@/components/common/horizontal-scroll";
import PartnerCard from "@/components/dashboard/partner-card";
import SkillCard from "@/components/dashboard/skill-card";
import { verifyToken } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// Interface untuk Response API Partner (/api/partner/recomendation)
interface PartnerApiResponse {
  id: string;
  avatar_url: string | null;
  full_name: string;
  username: string;
  skill_teach?: any;
  skill_learn?: any;
  match?: string;
}

// Interface untuk Response API Skill (/api/skill/recomendation)
interface SkillApiResponse {
  id: string;
  skill_name: string;
  skillCount: number;
}

// Interface yang dikirim ke komponen PartnerCard
export interface PartnerItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  match: number;
  teach: string[];
  learn: string[];
}

// Interface yang dikirim ke komponen SkillCard
export interface SkillItem {
  id: string;
  name: string;
  amountPeople: number;
  icon: string;
}

// Helper untuk membangun base URL absolut dari header request saat ini.
// Diperlukan karena Server Component tidak bisa fetch dengan relative URL,
// dan hardcode localhost akan gagal saat production (Vercel).
async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

// Helper rekursif untuk mendeteksi nama skill pada objek bersarang (nested)
function extractSkillName(item: any): string {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    if (typeof item.name === "string") return item.name;
    if (typeof item.skill_name === "string") return item.skill_name;
    if (typeof item.title === "string") return item.title;
    if (typeof item.name_skill === "string") return item.name_skill;
    if (typeof item.skill === "string") return item.skill;
    if (typeof item.skills === "string") return item.skills;

    // Jika objek bersarang seperti { skills: { id: "...", name: "React" } }
    if (item.skills && typeof item.skills === "object") {
      return extractSkillName(item.skills);
    }
    if (item.skill && typeof item.skill === "object") {
      return extractSkillName(item.skill);
    }
  }
  return "";
}

// Helper utama untuk mengekstrak array daftar skill dari berbagai format data
function parseSkillList(skillsInput: any): string[] {
  if (!skillsInput) return [];

  let parsedSkills = skillsInput;

  if (typeof skillsInput === "string") {
    try {
      parsedSkills = JSON.parse(skillsInput);
    } catch {
      return skillsInput.trim() !== "" ? [skillsInput] : [];
    }
  }

  if (Array.isArray(parsedSkills)) {
    return parsedSkills
      .map((item) => extractSkillName(item))
      .filter((name) => Boolean(name && name.trim() !== ""));
  }

  if (typeof parsedSkills === "object" && parsedSkills !== null) {
    const name = extractSkillName(parsedSkills);
    return name ? [name] : [];
  }

  return [];
}

// Helper ikon kategorikal berdasarkan nama skill
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
async function getPartnerRecommendations(
  token: string,
): Promise<PartnerItem[]> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/partner/recomendation`, {
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

    return data.map((item): PartnerItem => {
      const numericMatch =
        parseInt(item.match?.replace("%", "") || "0", 10) || 0;

      // Fallback pengecekan berbagai properti field dari response API
      const rawTeach =
        item.skill_teach ??
        (item as any).teachSkill ??
        (item as any).skills_teach ??
        (item as any).teach;

      const rawLearn =
        item.skill_learn ??
        (item as any).learnSkill ??
        (item as any).skills_learn ??
        (item as any).learn;

      const teachSkills = parseSkillList(rawTeach);
      const learnSkills = parseSkillList(rawLearn);

      return {
        id: item.id,
        name: item.full_name,
        username: item.username || item.id,
        avatar: item.avatar_url || "/profile.jpg",
        match: numericMatch,
        teach: teachSkills,
        learn: learnSkills,
      };
    });
  } catch (error) {
    console.error("Error fetching partner recommendations:", error);
    return [];
  }
}

// Fetch Rekomendasi Skill
async function getSkillRecommendations(token: string): Promise<SkillItem[]> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/skill/recomendation`, {
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

    const uniqueSkills = data.filter(
      (item, index, self) => self.findIndex((s) => s.id === item.id) === index,
    );

    return uniqueSkills.map(
      (item): SkillItem => ({
        id: item.id,
        name: item.skill_name,
        amountPeople: item.skillCount,
        icon: getSkillIcon(item.skill_name),
      }),
    );
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
    payload = verifyToken(token);
  } catch {
    redirect("/auth/login");
  }

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">Top Picks For You</h3>
            <p className="text-sm text-muted-foreground">
              People who want to learn what you teach, and can teach what you
              want to learn.
            </p>
          </div>
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
              {partners.map((partner: PartnerItem) => (
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
        <h3 className="text-xl font-semibold">Browse by Skills</h3>

        <div className="flex flex-col gap-4">
          {skills.length > 0 ? (
            <HorizontalScroll>
              {skills.map((skill: SkillItem, index: number) => (
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
