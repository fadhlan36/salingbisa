"use client";

import { cn } from "@/lib/utils";
import type { SkillItem } from "@/app/dashboard/page";
import {
  HiCode,
  HiChip,
  HiTrendingUp,
  HiBriefcase,
  HiLightBulb,
  HiGlobeAlt,
  HiColorSwatch,
} from "react-icons/hi";
import {
  FaReact,
  FaLaravel,
  FaPython,
  FaJs,
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
  FaVuejs,
  FaPhp,
  FaGitAlt,
  FaDatabase,
} from "react-icons/fa";

interface SkillFilterProps {
  skills: SkillItem[];
  selected: string | null;
  onSelect: (skillId: string | null) => void;
}

// Fungsi helper untuk merender ikon dengan warna kustom berdasarkan skill
const getSkillIconComponent = (name: string) => {
  const lower = name.toLowerCase();
  const iconClass = "w-3.5 h-3.5 shrink-0";

  // Framework & Bahasa Pemrograman Spesifik dengan warna khasnya
  if (lower.includes("react"))
    return <FaReact className={`${iconClass} text-sky-400`} />;
  if (lower.includes("laravel"))
    return <FaLaravel className={`${iconClass} text-red-500`} />;
  if (lower.includes("python"))
    return <FaPython className={`${iconClass} text-yellow-400`} />;
  if (lower.includes("javascript") || lower.includes("js"))
    return <FaJs className={`${iconClass} text-amber-400`} />;
  if (lower.includes("node"))
    return <FaNodeJs className={`${iconClass} text-emerald-500`} />;
  if (lower.includes("vue"))
    return <FaVuejs className={`${iconClass} text-emerald-400`} />;
  if (lower.includes("php"))
    return <FaPhp className={`${iconClass} text-indigo-400`} />;
  if (lower.includes("html"))
    return <FaHtml5 className={`${iconClass} text-orange-500`} />;
  if (lower.includes("css"))
    return <FaCss3Alt className={`${iconClass} text-blue-500`} />;
  if (lower.includes("git"))
    return <FaGitAlt className={`${iconClass} text-orange-600`} />;
  if (
    lower.includes("sql") ||
    lower.includes("database") ||
    lower.includes("mongo")
  )
    return <FaDatabase className={`${iconClass} text-blue-400`} />;

  // Kategori Umum
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux"))
    return <HiColorSwatch className={`${iconClass} text-pink-500`} />;
  if (lower.includes("code") || lower.includes("programming"))
    return <HiCode className={`${iconClass} text-violet-500`} />;
  if (
    lower.includes("data") ||
    lower.includes("ai") ||
    lower.includes("machine")
  )
    return <HiChip className={`${iconClass} text-amber-500`} />;
  if (lower.includes("market") || lower.includes("seo"))
    return <HiTrendingUp className={`${iconClass} text-emerald-500`} />;
  if (lower.includes("sale") || lower.includes("business"))
    return <HiBriefcase className={`${iconClass} text-blue-500`} />;
  if (lower.includes("web"))
    return <HiGlobeAlt className={`${iconClass} text-cyan-500`} />;

  // Default Fallback
  return <HiLightBulb className={`${iconClass} text-amber-400`} />;
};

export default function SkillFilter({
  skills,
  selected,
  onSelect,
}: SkillFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
            {getSkillIconComponent(skill.name)}
            <span>{skill.name}</span>
          </button>
        );
      })}
    </div>
  );
}
