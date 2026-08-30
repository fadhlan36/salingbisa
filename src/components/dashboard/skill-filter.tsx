"use client";

import { cn } from "@/lib/utils";
import type { SkillItem } from "@/app/dashboard/page";

interface SkillFilterProps {
  skills: SkillItem[];
  selected: string | null;
  onSelect: (skillId: string | null) => void;
}

export default function SkillFilter({
  skills,
  selected,
  onSelect,
}: SkillFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200",
          selected === null
            ? "border-[#4f39f6]/20 bg-[#4f39f6]/10 text-[#4f39f6] shadow-md shadow-[#4f39f6]/20"
            : "border-slate-200 bg-white text-slate-600 shadow-sm hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        )}
      >
        Semua
      </button>

      {skills.map((skill) => {
        const isActive = selected === skill.id;
        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => onSelect(skill.id)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200",
              isActive
                ? "border-[#4f39f6]/20 bg-[#4f39f6]/10 text-[#4f39f6] shadow-md shadow-[#4f39f6]/20"
                : "border-slate-200 bg-white text-slate-600 shadow-sm hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
            )}
          >
            <span className="text-sm leading-none">{skill.icon}</span>
            <span>{skill.name}</span>
          </button>
        );
      })}
    </div>
  );
}
