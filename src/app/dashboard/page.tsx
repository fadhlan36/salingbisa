import HorizontalScroll from "@/components/common/horizontal-scroll";
import PartnerCard from "@/components/dashboard/partner-card";
import SkillCard from "@/components/dashboard/skill-card";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Interface untuk data dari API
interface PartnerApiResponse {
  id: string;
  avatar_url: string | null;
  full_name: string;
  skill_teach: { name: string }[] | string[];
  skill_learn: { name: string }[] | string[];
  match: string; // "100%"
}

const skills = [
  {
    name: "UI Design",
    amountPeople: 120,
    icon: "🎨",
  },
  {
    name: "JavaScript",
    amountPeople: 250,
    icon: "💻",
  },
  {
    name: "Python",
    amountPeople: 160,
    icon: "🐍",
  },
  {
    name: "Marketing",
    amountPeople: 80,
    icon: "📈",
  },
  {
    name: "Sales",
    amountPeople: 230,
    icon: "💼",
  },
];

async function getPartnerRecommendations(token: string) {
  try {
    const res = await fetch("http://localhost:3000/api/partner/recomendation", {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: "no-store", // Selalu ambil data terbaru (Server-Side Rendering)
    });

    if (!res.ok) {
      console.error("Failed to fetch recommendations:", res.statusText);
      return [];
    }

    const data: PartnerApiResponse[] = await res.json();

    // Mapping response API ke format yang diharapkan PartnerCard
    return data.map((item) => {
      // Membersihkan string match dari karakter '%' jika PartnerCard butuh angka (misal: "100%" -> 100)
      const numericMatch = parseInt(item.match.replace("%", ""), 10) || 0;

      // Ambil skill pertama atau fallback text jika array masih kosong
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
        avatar: item.avatar_url || "/king.png", // Fallback avatar jika null
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

  // Fetch data dari API Backend
  const partners = await getPartnerRecommendations(token);

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
        {/* Skills */}
        <HorizontalScroll>
          {skills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
}
