// src/components/dashboard/partner-card.tsx
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { CheckCircle2 } from "lucide-react";

export type Partner = {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  match?: number;
  bio?: string;
  teach?: string[];
  learn?: string[];
  isMatched?: boolean;
};

type PartnerCardProps = {
  partner: Partner;
};

export default function PartnerCard({ partner }: PartnerCardProps) {
  const MAX_VISIBLE_SKILLS = 2;

  const renderSkillBadges = (
    skills: string[] = [],
    badgeStyle: string,
    label: string,
  ) => {
    if (!skills || skills.length === 0) return null;

    const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
    const hiddenCount = skills.length - MAX_VISIBLE_SKILLS;

    return (
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </span>
        <div className="flex flex-wrap gap-1">
          {visibleSkills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border-0 ring-0 ${badgeStyle}`}
            >
              {skill}
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <span className="text-[10px] font-semibold text-slate-300 self-center px-1">
              +{hiddenCount}
            </span>
          )}
        </div>
      </div>
    );
  };

  const profileUrl = `/dashboard/profile/${partner.username}${
    partner.isMatched ? "?isMatched=true" : ""
  }`;

  return (
    <Card className="group relative w-72 sm:w-80 h-[480px] shrink-0 rounded-[36px] p-0 border-0 ring-0 shadow-lg hover:shadow-2xl transition-all duration-300 ease-out overflow-hidden bg-black">
      <img
        src={partner.avatar}
        alt={partner.name}
        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end space-y-4 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-2xl font-bold tracking-tight truncate">
              {partner.name}
            </h3>
            <CheckCircle2 className="w-5 h-5 fill-white text-black shrink-0" />
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-white/10">
          {renderSkillBadges(
            partner.teach,
            "bg-white/20 text-white backdrop-blur-md",
            "Teaches",
          )}
          {renderSkillBadges(
            partner.learn,
            "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 backdrop-blur-md",
            "Wants to Learn",
          )}
        </div>

        <div className="pt-1">
          <Link
            href={profileUrl}
            className="w-full h-11 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 shadow-md"
          >
            View Profile
          </Link>
        </div>
      </div>
    </Card>
  );
}
