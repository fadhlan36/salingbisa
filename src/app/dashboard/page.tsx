import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import PartnerCard from "@/components/dashboard/partner-card";
import CoverflowCarousel from "@/components/dashboard/coverflow-carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { verifyToken } from "@/lib/auth";

interface PartnerApiResponse {
  id: string;
  avatar_url: string | null;
  full_name: string;
  username: string;
  skill_teach?: any;
  skill_learn?: any;
  match?: string;
}

interface SkillApiResponse {
  id: string;
  skill_name: string;
  skillCount: number;
}

export interface PartnerItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  match: number;
  teach: string[];
  learn: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  amountPeople: number;
  icon: string;
}

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

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

    if (item.skills && typeof item.skills === "object") {
      return extractSkillName(item.skills);
    }
    if (item.skill && typeof item.skill === "object") {
      return extractSkillName(item.skill);
    }
  }
  return "";
}

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
        avatar: item.avatar_url || "/profile.png",
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

  const firstName = payload?.full_name
    ? payload.full_name.split(" ")[0]
    : "there";

  // Filter partner yang memiliki tingkat match di atas 75%
  const highMatchPartners = partners.filter((partner) => partner.match > 70);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 w-full">
      <div className="space-y-10">
        {/* Top Picks Section - 3D Coverflow Carousel */}
        <div className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Top Picks For You
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Partner dengan kecocokan skill tertinggi untukmu.
              </p>
            </div>
          </div>

          {partners.length > 0 ? (
            <CoverflowCarousel>
              {partners.map((partner: PartnerItem) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </CoverflowCarousel>
          ) : (
            <div className="rounded-[28px] bg-slate-200/50 dark:bg-slate-900/60 py-12 text-center text-xs font-medium text-slate-400 border-0 ring-0">
              Belum ada rekomendasi partner yang ditemukan.
            </div>
          )}
        </div>

        {/* High Match Partners Grid Section (Match > 75%) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                High Compatibility Partners
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Rekomendasi partner dengan tingkat kecocokan di atas 75%.
              </p>
            </div>
          </div>

          {highMatchPartners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {highMatchPartners.map((partner: PartnerItem) => (
                <div
                  key={partner.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {partner.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 mt-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-md">
                        {partner.match}% Match
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">
                        Teaches:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {partner.teach.length > 0 ? (
                          partner.teach.slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`dashboard/profile/${partner.username}`}
                    className="w-full py-2 bg-[#4f39f6]/10 hover:bg-[#4f39f6] text-[#4f39f6] hover:text-white text-xs font-semibold rounded-xl text-center transition-colors block"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900/60 py-8 text-center text-xs font-medium text-slate-400">
              Belum ada partner dengan kecocokan di atas 75%.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
