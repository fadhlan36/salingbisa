"use client";

import { useMemo, useState, useEffect } from "react";

import SkillFilter from "@/components/dashboard/skill-filter";
import PartnerCard from "@/components/dashboard/partner-card";
import CoverflowCarousel from "@/components/dashboard/coverflow-carousel";
import type { PartnerItem, SkillItem } from "@/app/dashboard/page";

interface TopPicksSectionProps {
  partners: PartnerItem[];
  skills: SkillItem[];
}

export default function TopPicksSection({
  partners,
  skills,
}: TopPicksSectionProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedSkillName = useMemo(
    () => skills.find((skill) => skill.id === selectedSkillId)?.name ?? null,
    [skills, selectedSkillId],
  );

  const filteredPartners = useMemo(() => {
    if (!selectedSkillName) return partners;
    return partners.filter((partner) =>
      partner.teach.some(
        (skill) => skill.toLowerCase() === selectedSkillName.toLowerCase(),
      ),
    );
  }, [partners, selectedSkillName]);

  return (
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

      <SkillFilter
        skills={skills}
        selected={selectedSkillId}
        onSelect={setSelectedSkillId}
      />

      {/* Bagian Carousel dengan Animasi Pop-up & Bouncing yang Lebih Lambat */}
      <div
        className={
          isMounted ? "animate-pop-bounce-slow origin-center" : "opacity-0"
        }
      >
        {filteredPartners.length > 0 ? (
          <CoverflowCarousel>
            {filteredPartners.map((partner: PartnerItem) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </CoverflowCarousel>
        ) : (
          <div className="rounded-[28px] bg-slate-200/50 dark:bg-slate-900/60 py-12 text-center text-xs font-medium text-slate-400 border-0 ring-0">
            {selectedSkillName
              ? `Belum ada partner dengan skill "${selectedSkillName}" yang ditemukan.`
              : "Belum ada rekomendasi partner yang ditemukan."}
          </div>
        )}
      </div>

      {/* Definisi Keyframes CSS Kustom (Durasi diperlambat ke 0.8s) */}
      <style jsx global>{`
        @keyframes popBounceSlow {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.03);
          }
          75% {
            transform: scale(0.97);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-pop-bounce-slow {
          animation: popBounceSlow 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
        }
      `}</style>
    </div>
  );
}
