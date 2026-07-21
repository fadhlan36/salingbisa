import HorizontalScroll from "@/components/common/horizontal-scroll";
import PartnerCard from "@/components/dashboard/partner-card";
import SkillCard from "@/components/dashboard/skill-card";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const partners = [
  {
    name: "Andi Pratama",
    avatar: "/king.png",
    match: 96,
    teach: "UI Design",
    learn: "React",
  },
  {
    name: "Budi Santoso",
    avatar: "/king.png",
    match: 85,
    teach: "JavaScript",
    learn: "Python",
  },
  {
    name: "Citra Dewi",
    avatar: "/king.png",
    match: 92,
    teach: "Marketing",
    learn: "Sales",
  },
  {
    name: "Dika Pratama",
    avatar: "/king.png",
    match: 78,
    teach: "Photography",
    learn: "Video Editing",
  },
];

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

  return (
    <section className="mx-auto max-w-7xl space-y-8">
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
          <HorizontalScroll>
            {partners.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} />
            ))}
          </HorizontalScroll>
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
