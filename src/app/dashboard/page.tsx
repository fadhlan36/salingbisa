import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import PartnerCard from "@/components/dashboard/partner-card";
import SkillCard from "@/components/dashboard/skill-card";
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

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 w-full">
      <div className="space-y-10">
        {/* Header Salam Pembuka */}
        {/* <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Halo, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            Eksplorasi rekan belajar dan kembangkan keahlianmu hari ini.
          </p>
        </div> */}

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
            {/* <Link
              href="/dashboard/partners"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4f39f6] hover:opacity-80 transition-opacity"
            >
              See all
              <span className="text-sm">→</span>
            </Link> */}
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

        {/* Skills Section (Carousel Standar) */}
        {/* <div className="space-y-4">
          <div className="px-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Browse by Skills
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Keahlian paling banyak diminati oleh komunitas.
            </p>
          </div>

          {skills.length > 0 ? (
            <Carousel
              opts={{ align: "start" }}
              className="w-full relative group"
            >
              <CarouselContent className="-ml-4">
                {skills.map((skill: SkillItem, index: number) => (
                  <CarouselItem
                    key={`${skill.id}-${index}`}
                    className="pl-4 basis-auto"
                  >
                    <SkillCard skill={skill} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Carousel>
          ) : (
            <div className="rounded-[24px] bg-slate-200/50 dark:bg-slate-900/60 py-12 text-center text-xs font-medium text-slate-400 border-0 ring-0">
              Belum ada rekomendasi skill yang tersedia.
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}
