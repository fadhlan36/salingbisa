// src/components/dashboard/skill-card.tsx
import { Card } from "../ui/card";
import { Users } from "lucide-react";

export type Skill = {
  id?: string;
  name: string;
  amountPeople: number;
  icon: string;
};

type SkillCardProps = {
  skill: Skill;
};

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card className="group relative flex items-center gap-4 w-60 sm:w-64 rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0 shadow-sm hover:shadow-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-slate-100 dark:bg-slate-800 text-2xl group-hover:bg-[#4f39f6] group-hover:text-white transition-colors duration-300">
        {skill.icon}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
          {skill.name}
        </h4>
        <div className="flex items-center gap-1 mt-0.5 text-slate-500 dark:text-slate-400">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            {skill.amountPeople}+ members
          </span>
        </div>
      </div>
    </Card>
  );
}
