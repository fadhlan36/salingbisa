"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, ChevronDown, Loader2, RefreshCw } from "lucide-react";
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
  const [hasScrolled, setHasScrolled] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top khusus mobile container
  const scrollToTopMobile = () => {
    mobileContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, page, error]);

  return (
    <section className="w-full md:mx-auto md:max-w-7xl">
      {/* MOBILE VERSION — Full Width & Center Fitted                  */}
      <div
        ref={mobileContainerRef}
        onScroll={(e) => {
          // Jika posisi scroll vertikal lebih dari 20px, sembunyikan indikator
          if (e.currentTarget.scrollTop > 20 && !hasScrolled) {
            setHasScrolled(true);
          }
        }}
        className="md:hidden h-[calc(100dvh-4rem)] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth bg-background"
      >
        {/* Tiap partner card — snap child */}
        {partners.map((partner, index) => {
          const delay = (index % 10) * 150;

          return (
            <div
              key={partner.id}
              className="relative flex h-full w-full snap-center snap-always items-center justify-center p-4"
            >
              {/* Floating Header Badge khusus pada slide pertama */}
              {index === 0 && (
                <div className="absolute top-6 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span className="rounded-full bg-slate-900/80 dark:bg-slate-100/10 px-4 py-1.5 text-xs font-medium text-white dark:text-slate-200 backdrop-blur-md border border-white/10 shadow-lg">
                    ✨ Find your learning partner
                  </span>
                </div>
              )}

              {/* Card wrapper */}
              <div
                className="w-full aspect-[3/4] max-h-[85%] animate-pop-in-bouncy flex justify-center items-center [&>div]:w-full [&>div]:h-full"
                style={{ animationDelay: `${delay}ms` }}
              >
                <PartnerCard partner={partner} />
              </div>

              {/* Indicator Scroll Down khusus slide pertama */}
              {index === 0 && !hasScrolled && (
                <div
                  className="absolute bottom-2 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none animate-bounce transition-opacity duration-300"
                  style={{ animationDuration: "2s" }}
                >
                  <span className="rounded-full bg-slate-900/80 dark:bg-slate-900/90 px-3 py-1 text-[10px] font-medium tracking-wider uppercase text-white/90 backdrop-blur-md border border-white/10 shadow-lg">
                    Scroll Down
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-800 dark:text-slate-200 drop-shadow-md -mt-0.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* End of list card */}
        {!hasMore && !loading && partners.length > 0 && (
          <div className="flex h-full w-full snap-center snap-always items-center justify-center p-4">
            <div className="flex w-full aspect-[3/4] max-h-[85%] flex-col items-center justify-center space-y-4 rounded-[36px] border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-950/50">
                ✨
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  You&apos;ve Reached the End!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Haven&apos;t found the right partner yet? Try updating your
                  search keywords.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTopMobile}
                className="rounded-full text-xs"
              >
                Back to Top
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex h-full w-full snap-center snap-always items-center justify-center p-4 shrink-0">
            <div className="flex w-full max-w-[320px] flex-col items-center justify-center space-y-4 rounded-[32px] border border-red-200/80 bg-red-50/50 p-6 text-center dark:border-red-900/30 dark:bg-red-950/20 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Oops! Something went wrong
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPartners(page)}
                className="rounded-full text-xs gap-2 border-red-200 hover:bg-red-100/50 dark:border-red-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Seamless Infinite Scroll Trigger & Center Loading */}
        {hasMore && !error && (
          <div
            ref={observerRef}
            className="flex h-full w-full snap-center snap-always items-center justify-center p-4 shrink-0"
          >
            {loading && (
              <div className="flex w-full max-w-[320px] flex-col items-center justify-center space-y-4 rounded-[32px] border border-slate-200/80 bg-white/60 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Finding potential partners...
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Please wait a moment while we fetch more profiles for you.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP VERSION — Normal Grid & Scroll                       */}
      <div className="hidden md:block space-y-8 p-6 lg:p-8">
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

        <div className="grid grid-cols-2 justify-items-center gap-6 xl:grid-cols-3">
          {partners.map((partner, index) => {
            const delay = (index % 10) * 150;

            return (
              <div
                key={partner.id}
                className="relative flex w-full items-center justify-center [&>div]:w-full [&>div]:max-w-none sm:[&>div]:w-80"
              >
                <div
                  className="pointer-events-none absolute inset-2 rounded-[28px] bg-gradient-to-r from-white/70 via-indigo-400 to-indigo-600 blur-md animate-rainbow-flash opacity-0"
                  style={{ animationDelay: `${delay}ms` }}
                />

                <div
                  className="flex w-full animate-pop-in-bouncy justify-center opacity-0 [&>div]:w-full [&>div]:max-w-none sm:[&>div]:w-80"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <PartnerCard partner={partner} />
                </div>
              </div>
            );
          })}

          {!hasMore && !loading && (
            <div className="flex w-full items-center justify-center [&>div]:w-full [&>div]:max-w-none sm:[&>div]:w-80">
              <div className="flex h-[480px] w-72 flex-col items-center justify-center space-y-4 rounded-[36px] border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50 sm:w-80">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-950/50">
                  ✨
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    You&apos;ve Reached the End!
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Haven&apos;t found the right partner yet? Try updating your
                    search keywords.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="rounded-full text-xs"
                >
                  Back to Top
                </Button>
              </div>
            </div>
          )}
        </div>

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

        <div className="mt-8 pb-2 pt-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              Loading more partners...
            </div>
          )}

          {!hasMore && !loading && partners.length > 0 && (
            <div className="relative flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex items-center gap-2 bg-transparent px-4 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                You&apos;ve reached the end of the list
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
