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
              "",
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
    <div className="container mx-auto max-w-5xl space-y-6 px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            My Partners
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            List of users you have successfully matched with.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 focus-visible:ring-blue-600"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPartners}
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPartners.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No Partners Found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "No partners match your search criteria."
              : "You haven't matched with any partners yet. Start exploring skills in the dashboard!"}
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Clear Search
            </Button>
          )}
        </Card>
      )}

      {/* Partner List */}
      {!loading && !error && filteredPartners.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredPartners.map((partner, index) => (
            <Card
              key={`partner-${partner.id}-${index}`}
              className="transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
            >
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border border-blue-100">
                    <AvatarImage
                      src={partner.avatar_url}
                      alt={partner.full_name}
                    />
                    <AvatarFallback className="bg-blue-50 text-sm font-bold text-blue-600">
                      {getInitials(partner.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold leading-tight text-gray-900">
                      {partner.full_name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      @{partner.username}
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2 border-t border-gray-100 pt-2 sm:w-auto sm:border-t-0 sm:pt-0">
                  <Button
                    asChild
                    size="sm"
                    className="h-9 flex-1 gap-2 bg-blue-600 px-4 text-white hover:bg-blue-700 sm:flex-none"
                  >
                    <Link href={`/dashboard/messages?userId=${partner.id}`}>
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 gap-2 px-4 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:flex-none"
                  >
                    {/* Mengirimkan query param isMatched=true ke halaman profile */}
                    <Link
                      href={`/dashboard/profile/${partner.username}?isMatched=true`}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
