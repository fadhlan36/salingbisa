import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

type PartnerCardProps = {
  partner: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
    match: number;
    teach: string[];
    learn: string[];
    isMatched?: boolean;
  };
};

export default function PartnerCard({ partner }: PartnerCardProps) {
  const MAX_VISIBLE_SKILLS = 3;

  const renderSkillBadges = (
    skills: string[],
    badgeStyle: string,
    fallbackText: string,
  ) => {
    if (!skills || skills.length === 0) {
      return (
        <span className="text-xs text-muted-foreground italic">
          {fallbackText}
        </span>
      );
    }

    const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
    const hiddenCount = skills.length - MAX_VISIBLE_SKILLS;

    return (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {visibleSkills.map((skill, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={`text-[11px] font-medium px-2.5 py-0.5 border-none shadow-none rounded-md transition-transform hover:scale-105 ${badgeStyle}`}
          >
            {skill}
          </Badge>
        ))}

        {hiddenCount > 0 && (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold px-2 py-0.5 text-slate-500 rounded-md border-slate-200"
          >
            +{hiddenCount}
          </Badge>
        )}
      </div>
    );
  };

  const profileUrl = `/dashboard/profile/${partner.username}${
    partner.isMatched ? "?isMatched=true" : ""
  }`;

  return (
    <Card className="relative w-60 sm:w-64 shrink-0 rounded-2xl p-5 shadow-sm border bg-card flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      {/* Top Header: Badge Match */}
      <div className="flex items-center justify-between">
        <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold px-2.5 py-0.5 text-xs shadow-none">
          {partner.match}% Match
        </Badge>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center my-3 gap-2">
        <img
          src={partner.avatar}
          className="h-20 w-20 rounded-full object-cover bg-slate-100 ring-4 ring-slate-50 dark:ring-slate-900 shadow-inner"
          alt={partner.name}
        />
        <h2 className="text-center text-base font-bold text-foreground line-clamp-1">
          {partner.name}
        </h2>
      </div>

      {/* Skills Section */}
      <div className="space-y-3 my-2">
        {/* Can Teach */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 tracking-wide uppercase">
              Can Teach
            </p>
          </div>
          {renderSkillBadges(
            partner.teach,
            "bg-indigo-100/80 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200",
            "Not specified",
          )}
        </div>

        {/* Wants to Learn */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 tracking-wide uppercase">
              Wants to Learn
            </p>
          </div>
          {renderSkillBadges(
            partner.learn,
            "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
            "Not specified",
          )}
        </div>
      </div>

      {/* Redirect ke halaman profile pengguna berdasarkan username */}
      <Button
        asChild
        variant="default"
        className="w-full mt-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all"
      >
        <Link href={profileUrl}>View Profile</Link>
      </Button>
    </Card>
  );
}
