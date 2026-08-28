"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import PartnerCard from "@/components/dashboard/partner-card";
import { Button } from "@/components/ui/button";

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

export default function Explorer() {
  const [partners, setPartners] = useState<PartnerType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Fungsi pemanggil API
  const fetchPartners = useCallback(async (pageToFetch: number) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/partner/explore?page=${pageToFetch}&limit=10`,
      );

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch partners data.");
      }

      const json = await res.json();

      // Ekstraksi data dari struktur array response backend
      const responseData = Array.isArray(json) ? json[0] : json;
      const rawItems = responseData?.data || [];
      const pagination = responseData?.pagination;

      // Map format API ke format PartnerCardProps
      const normalizedPartners: PartnerType[] = rawItems.map((item: any) => ({
        id: String(item.id),
        name: item.full_name || item.username || "No Name",
        username: String(item.username || item.id).replace(/^@/, ""),
        avatar: item.avatar_url || "/profile.png",
        match:
          typeof item.match === "string"
            ? parseFloat(item.match) || 0
            : item.match || 0,
        teach: Array.isArray(item.skill_teach) ? item.skill_teach : [],
        learn: Array.isArray(item.skill_learn) ? item.skill_learn : [],
        isMatched: Boolean(item.isMatched),
      }));

      // Tambahkan data baru ke state tanpa menduplikasi data
      setPartners((prev) =>
        pageToFetch === 1
          ? normalizedPartners
          : [...prev, ...normalizedPartners],
      );

      // Cek apakah masih ada data selanjutnya berdasarkan pagination API
      if (pagination) {
        setHasMore(pagination.hasMore);
      } else {
        setHasMore(normalizedPartners.length === 10);
      }
    } catch (err: unknown) {
      console.error("Error fetching partners:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch halaman pertama saat load awal
  useEffect(() => {
    fetchPartners(1);
  }, [fetchPartners]);

  // Handler untuk load page berikutnya
  const loadMorePartners = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPartners(nextPage);
    }
  };

  // Setup Intersection Observer untuk trigger infinite scroll
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          loadMorePartners();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, page, error]);

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 pb-10 md:pt-20 sm:px-6">
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

      {/* Flex Wrapper untuk PartnerCard fixed-width */}
      <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="w-full flex justify-center [&>div]:w-full [&>div]:max-w-none sm:[&>div]:w-64"
          >
            <PartnerCard partner={partner} />
          </div>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPartners(page)}
            className="mt-3 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Infinite Scroll Indicator */}
      <div ref={observerRef} className="flex justify-center py-6">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            Loading more partners...
          </div>
        )}
        {!hasMore && !loading && partners.length > 0 && (
          <p className="text-xs text-muted-foreground">
            You've reached the end of the list.
          </p>
        )}
      </div>
    </section>
  );
}
