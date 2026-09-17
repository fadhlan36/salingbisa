"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  RefreshCw,
  SearchX,
} from "lucide-react";
import PartnerCard from "@/components/dashboard/partner-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type PartnerType = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  match: number;
  teach: string[];
  learn: string[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();

  const [partners, setPartners] = useState<PartnerType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Filter yang aktif dari URL — dipakai untuk query API & ditampilkan di header
  const activeSearch = searchParams.get("search") || "";
  const activeTeach = searchParams.get("teach") || "";
  const activeLearn = searchParams.get("learn") || "";
  const activeLocation = searchParams.get("location") || "";

  // String gabungan filter (tanpa page), dipakai sebagai dependency effect
  // Supaya effect ini cuma jalan kalau FILTER-nya berubah, bukan tiap kali page berubah
  const filterKey = `${activeSearch}|${activeTeach}|${activeLearn}|${activeLocation}`;

  const fetchPartners = useCallback(
    async (pageToFetch: number) => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (activeSearch) query.set("search", activeSearch);
        if (activeTeach) query.set("teach", activeTeach);
        if (activeLearn) query.set("learn", activeLearn);
        if (activeLocation) query.set("location", activeLocation);
        query.set("page", String(pageToFetch));
        query.set("limit", "12");

        const res = await fetch(`/api/partner?${query.toString()}`);

        if (res.status === 401) {
          window.location.href = "/auth/login";
          return;
        }

        if (!res.ok) {
          throw new Error("Gagal mengambil hasil pencarian.");
        }

        const json = await res.json();
        const rawItems = json?.data || [];

        const normalized: PartnerType[] = rawItems.map((item: any) => ({
          id: String(item.id),
          name: item.full_name || item.username || "No Name",
          username: String(item.username || item.id).replace(/^@/, ""),
          avatar: item.avatar_url || "/profile.jpg",
          match: typeof item.match === "number" ? item.match : 100,
          teach:
            Array.isArray(item.teach) && item.teach.length
              ? item.teach
              : ["Not specified"],
          learn:
            Array.isArray(item.learn) && item.learn.length
              ? item.learn
              : ["Not specified"],
        }));

        setPartners((prev) =>
          pageToFetch === 1 ? normalized : [...prev, ...normalized],
        );

        // API belum kirim info total halaman, jadi pakai heuristik:
        // kalau data yang balik penuh sesuai limit, anggap masih ada halaman berikutnya
        setHasMore(normalized.length === 12);
      } catch (err: unknown) {
        console.error("Error fetching search results:", err);
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.",
        );
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSearch, activeTeach, activeLearn, activeLocation],
  );

  // Reset & fetch ulang dari halaman 1 setiap kali FILTER berubah (bukan page)
  useEffect(() => {
    setPage(1);
    setPartners([]);
    setHasMore(true);
    setInitialLoad(true);
    fetchPartners(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const loadMorePartners = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPartners(nextPage);
    }
  };

  // Infinite scroll trigger
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          loadMorePartners();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, page, error]);

  const hasActiveFilter =
    activeSearch || activeTeach || activeLearn || activeLocation;

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Hasil Pencarian
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-0.5">
          {hasActiveFilter ? (
            <>
              {activeSearch && <>Kata kunci: &quot;{activeSearch}&quot; </>}
              {activeTeach && <>· Mengajar: {activeTeach} </>}
              {activeLearn && <>· Belajar: {activeLearn} </>}
              {activeLocation && <>· Lokasi: {activeLocation}</>}
            </>
          ) : (
            "Menampilkan semua partner"
          )}
        </p>
      </div>

      {/* Grid hasil */}
      <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner, index) => {
          const delay = (index % 12) * 100;
          return (
            <div
              key={partner.id}
              className="flex w-full animate-pop-in-bouncy justify-center opacity-0 [&>div]:w-full [&>div]:max-w-none sm:[&>div]:w-80"
              style={{ animationDelay: `${delay}ms` }}
            >
              <PartnerCard partner={partner} />
            </div>
          );
        })}

        {/* Skeleton loading */}
        {loading &&
          Array.from({ length: initialLoad ? 6 : 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex w-full justify-center [&>div]:w-full [&>div]:max-w-none sm:[&>div]:w-80"
            >
              <div className="flex h-[480px] w-72 flex-col justify-between rounded-[36px] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:w-80">
                <div className="flex flex-col items-center space-y-3 pt-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-5 w-36 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <div className="space-y-4 my-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-md" />
                    <div className="flex flex-wrap gap-1.5">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 rounded-md" />
                    <div className="flex flex-wrap gap-1.5">
                      <Skeleton className="h-6 w-18 rounded-full" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          ))}
      </div>

      {/* Empty state — belum ada hasil sama sekali */}
      {!loading && !error && partners.length === 0 && (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-[36px] border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50">
            <SearchX className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Tidak ada partner ditemukan
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Coba ubah kata kunci atau filter yang kamu gunakan.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
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
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Trigger infinite scroll — invisible, cuma buat detect scroll ke bawah */}
      {hasMore && !error && partners.length > 0 && (
        <div ref={observerRef} className="flex justify-center py-4">
          {loading && !initialLoad && (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && !loading && partners.length > 0 && (
        <div className="pb-2 pt-4">
          <div className="relative flex items-center justify-center">
            <div className="relative flex items-center gap-2 bg-transparent px-4 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              Kamu sudah mencapai akhir daftar
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
