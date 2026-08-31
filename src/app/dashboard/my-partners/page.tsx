"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, User, Search, Users, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export interface Partner {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

export default function MyPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/matches");

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch partner data.");
      }

      const json = await res.json();

      let rawItems: any[] = [];
      if (Array.isArray(json) && json.length > 0 && json[0]?.data) {
        rawItems = json[0].data;
      } else if (json?.data && Array.isArray(json.data)) {
        rawItems = json.data;
      } else if (Array.isArray(json)) {
        rawItems = json;
      }

      const normalizedPartners: Partner[] = rawItems
        .filter((item) => item && (item.partner || item.id))
        .map((item: any, index: number) => {
          const partnerData = item.partner || item;

          const rawUser =
            partnerData.username || partnerData.user_name || "unknown";

          return {
            id: String(
              partnerData.id ||
                partnerData.user_id ||
                item.id ||
                `partner-${index}`,
            ),
            username: String(rawUser).replace(/^@/, ""),
            full_name:
              partnerData.full_name ||
              partnerData.fullName ||
              partnerData.name ||
              partnerData.username ||
              "No Name",
            avatar_url:
              partnerData.avatar_url ||
              partnerData.avatarUrl ||
              partnerData.avatar ||
              "/profile.jpg",
          };
        });

      setPartners(normalizedPartners);
    } catch (err: unknown) {
      console.error("Error fetching matches:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter((partner) => {
    const query = searchQuery.toLowerCase();
    const fullName = (partner.full_name || "").toLowerCase();
    const username = (partner.username || "").toLowerCase();

    return fullName.includes(query) || username.includes(query);
  });

  const getInitials = (name: string) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 w-full mt-6 pb-28 sm:pb-8 space-y-6">
      {/* Header & Search Bar Layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Partners
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Daftar pengguna yang sudah terhubung dan cocok denganmu.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama atau username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-full border-0 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-[#4f39f6] text-xs font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="overflow-hidden border-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] rounded-[22px] bg-white dark:bg-slate-900"
            >
              <CardContent className="flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center space-x-3.5">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="border-0 shadow-lg rounded-[24px] bg-red-50/50 dark:bg-red-950/20 p-8 text-center">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPartners}
            className="mt-4 gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPartners.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-0 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[28px] bg-white dark:bg-slate-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4f39f6]/10 text-[#4f39f6]">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
            No Partners Found
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {searchQuery
              ? "Tidak ada partner yang cocok dengan kata kunci pencarianmu."
              : "Kamu belum terhubung dengan partner manapun. Mulai jelajahi skill dan temukan partner terbaikmu!"}
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs font-semibold text-[#4f39f6] hover:text-[#432ecb] hover:bg-[#4f39f6]/10 rounded-full px-4"
            >
              Clear Search
            </Button>
          )}
        </Card>
      )}

      {/* Partner Grid Horizontal Layout (Max 3 columns) */}
      {!loading && !error && filteredPartners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredPartners.map((partner, index) => (
            <Card
              key={`partner-${partner.id}-${index}`}
              className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(79,57,246,0.08)] transition-all duration-200 rounded-[20px] bg-white dark:bg-slate-900 overflow-hidden group"
            >
              <CardContent className="flex items-center justify-between p-3.5 sm:px-4 sm:py-3.5 gap-2">
                {/* Info Pengguna */}
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar className="h-11 w-11 border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <AvatarImage
                      src={partner.avatar_url || "/profile.jpg"}
                      alt={partner.full_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#4f39f6]/10 text-xs font-bold text-[#4f39f6]">
                      {getInitials(partner.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                      {partner.full_name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 truncate">
                      @{partner.username}
                    </p>
                  </div>
                </div>

                {/* Tombol Aksi Minimalis dengan Ikon Terang & Soft */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    asChild
                    size="sm"
                    className="h-7.5 px-2.5 rounded-full text-[10px] font-medium bg-[#4f39f6]/10 hover:bg-[#4f39f6] text-[#4f39f6] hover:text-white transition-all shadow-none"
                  >
                    <Link href={`/dashboard/messages?userId=${partner.id}`}>
                      {/* Ikon terang bernuansa soft/pastel */}
                      <MessageSquare className="h-3 w-3 text-[#7c6ff8] group-hover:text-white transition-colors" />
                      <span className="ml-1">Chat</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7.5 px-2.5 rounded-full text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <Link
                      href={`/dashboard/profile/${partner.username}?isMatched=true`}
                    >
                      {/* Ikon terang bernuansa soft/pastel */}
                      <User className="h-3 w-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                      <span className="ml-1">Profile</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
