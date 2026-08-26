"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import PartnerCard from "@/components/dashboard/partner-card";

type PartnerType = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  match: number;
  teach: string[];
  learn: string[];
  isMatched?: boolean;
};

// Helper generator untuk membuat dummy data per batch (20 data)
const generateDummyPartners = (
  startIndex: number,
  count: number = 20,
): PartnerType[] => {
  const teachPool = [
    ["React", "TypeScript", "Tailwind CSS"],
    ["Node.js", "Express", "PostgreSQL"],
    ["UI/UX Design", "Figma"],
    ["Python", "FastAPI", "Docker"],
  ];

  const learnPool = [
    ["Next.js", "GraphQL"],
    ["Go", "Kubernetes"],
    ["React Native", "Flutter"],
    ["Vue.js", "Nuxt"],
  ];

  return Array.from({ length: count }, (_, i) => {
    const id = startIndex + i + 1;
    return {
      id: `partner-${id}`,
      name: `Partner User ${id}`,
      username: `user_${id}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=partner_${id}`,
      match: Math.floor(Math.random() * 25) + 75, // Random 75% - 99%
      teach: teachPool[id % teachPool.length],
      learn: learnPool[id % learnPool.length],
      isMatched: false,
    };
  });
};

export default function Explorer() {
  const [partners, setPartners] = useState<PartnerType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Load awal 10 dummy data
  useEffect(() => {
    setPartners(generateDummyPartners(0, 10));
  }, []);

  // Handler simulasi fetch data berikutnya untuk infinite scroll
  const loadMorePartners = () => {
    if (loading || !hasMore) return;
    setLoading(true);

    setTimeout(() => {
      setPartners((prev) => {
        const nextBatch = generateDummyPartners(prev.length, 10);
        // Batasi maksimal 60 data untuk simulasi dummy
        if (prev.length + nextBatch.length >= 60) {
          setHasMore(false);
        }
        return [...prev, ...nextBatch];
      });
      setLoading(false);
    }, 1000);
  };

  // Setup Intersection Observer untuk memicu loadMore saat mendekati bawah
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePartners();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, partners.length]);

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-20 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Find your learning partner
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            People you might match with.
          </p>
        </div>
      </div>

      {/* Content: Grid Wrapper untuk memanggil PartnerCard */}
      <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>

      {/* Infinite Scroll Trigger Indicator */}
      <div ref={observerRef} className="flex justify-center py-6">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            Loading more partners...
          </div>
        )}
        {!hasMore && (
          <p className="text-xs text-muted-foreground">
            You&apos;ve reached the end of the list.
          </p>
        )}
      </div>
    </section>
  );
}
