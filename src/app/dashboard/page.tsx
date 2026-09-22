import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import TopPicksSection from "@/components/dashboard/top-picks-section";
import { verifyToken } from "@/lib/auth";
import {
  getPartnerRecommendations,
  PartnerRecommendationItem,
} from "@/lib/partners";
import { getSkillRecommendations } from "@/lib/skills";
import type { PartnerItem, SkillItem } from "@/types/dashboard";

// Threshold persentase match untuk masing-masing section
const TOP_PICKS_MIN_MATCH = 75;
const HIGH_COMPATIBILITY_MIN_MATCH = 70;

// ===================================================================
// Skeleton — dirender instan sebelum data siap
// ===================================================================
function DashboardContentSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900/60" />
      <div className="space-y-4 pt-4">
        <div className="h-6 w-64 rounded bg-slate-100 dark:bg-slate-900/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-900/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// Konten async — satu boundary Suspense untuk TopPicks + High Match,
// karena keduanya memakai data partner recommendation yang sama
// (menghindari fetch/RPC dobel).
// ===================================================================
async function DashboardContent({ userId }: { userId: string }) {
  const [partners, skills] = await Promise.all([
    getPartnerRecommendations(userId),
    getSkillRecommendations(userId),
  ]);

  // Top Picks: partner dengan match SANGAT tinggi (>= 80%)
  const topPicksPartners = partners.filter(
    (partner) => Number.parseInt(partner.match) >= TOP_PICKS_MIN_MATCH,
  );

  // High Compatibility: partner dengan match tinggi (>= 70%)
  const highMatchPartners = partners.filter(
    (partner) => Number.parseInt(partner.match) >= HIGH_COMPATIBILITY_MIN_MATCH,
  );

  return (
    <div className="space-y-10">
      {/* Top Picks Section - 3D Coverflow Carousel, dengan filter skill */}
      <TopPicksSection
        partners={topPicksPartners.map(mapToUiPartner)}
        skills={skills.map(
          (skill): SkillItem => ({
            id: skill.id,
            name: skill.skill_name,
            amountPeople: skill.skillCount,
            icon: getSkillIcon(skill.skill_name),
          }),
        )}
      />

      {/* High Match Partners Grid Section (Match >= 70%) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              High Compatibility Partners
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Rekomendasi partner dengan tingkat kecocokan yang tinggi.
            </p>
          </div>
        </div>

        {highMatchPartners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {highMatchPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={partner.avatar_url || "/profile.jpg"}
                    alt={partner.full_name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {partner.full_name}
                    </h3>
                    <span className="inline-block px-2 py-0.5 mt-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-md">
                      {partner.match} Match
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Teaches:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {partner.teachSkill.length > 0 ? (
                        partner.teachSkill.slice(0, 2).map((skill, idx) => (
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
                  href={`/dashboard/profile/${partner.username}`}
                  className="w-full py-2 bg-[#4f39f6]/10 hover:bg-[#4f39f6] text-[#4f39f6] hover:text-white text-xs font-semibold rounded-xl text-center transition-colors block"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-900/60 py-8 text-center text-xs font-medium text-slate-400">
            Belum ada partner dengan kecocokan tinggi.
          </div>
        )}
      </div>
    </div>
  );
}

// ===================================================================
// Helpers
// ===================================================================
function mapToUiPartner(partner: PartnerRecommendationItem): PartnerItem {
  return {
    id: partner.id,
    name: partner.full_name,
    username: partner.username || partner.id,
    avatar: partner.avatar_url || "/profile.jpg",
    match: Number.parseInt(partner.match) || 0,
    teach: partner.teachSkill,
    learn: partner.learnSkill,
  };
}

function getSkillIcon(name: string) {
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
}

// ===================================================================
// Page (Server Component) — shell render instan, auth check saja
// di sini, data fetch didelegasikan ke DashboardContent lewat Suspense
// ===================================================================
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

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 w-full mt-6 pb-28 sm:pb-8">
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent userId={payload!.userId} />
      </Suspense>
    </div>
  );
}
