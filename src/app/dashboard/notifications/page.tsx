"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Users, Check, X, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useBadgeCount } from "@/app/hooks/useBadgeCount";

interface PendingRequest {
  matchId: string;
  userId: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

export default function PendingRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const { mutate } = useBadgeCount();

  const acceptRequest = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/requests/${matchId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "accepted",
        }),
      });

      if (response.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to accept match");
      }

      setRequests((prev) =>
        prev.filter((request) => request.matchId !== matchId),
      );
      mutate();
    } catch (error) {
      console.error("Error accepting match:", error);
    }
  };

  const rejectRequest = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/requests/${matchId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reject match");
      }

      setRequests((prev) =>
        prev.filter((request) => request.matchId !== matchId),
      );
      mutate();
    } catch (error) {
      console.error("Error rejecting match:", error);
    }
  };

  const fetchPendingPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/matches/requests");
      if (!res.ok) {
        throw new Error("Failed to fetch pending match requests.");
      }

      const json = await res.json();

      let rawItems: any[] = [];
      if (Array.isArray(json.data)) {
        rawItems = json.data;
      } else if (Array.isArray(json)) {
        rawItems = json;
      } else if (json?.data?.data && Array.isArray(json.data.data)) {
        rawItems = json.data.data;
      }

      const normalizedRequests: PendingRequest[] = rawItems
        .filter((item) => item && item.sender)
        .map((item: any) => {
          const senderData = Array.isArray(item.sender)
            ? item.sender[0]
            : item.sender;

          return {
            matchId: String(item.id),
            userId: String(senderData?.id || ""),
            username: String(senderData?.username || "unknown").replace(
              /^@/,
              "",
            ),
            full_name:
              senderData?.full_name || senderData?.username || "No Name",
            avatar_url: senderData?.avatar_url || "",
          };
        });

      setRequests(normalizedRequests);
    } catch (err: unknown) {
      console.error("Error fetching pending matches:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPartners();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-24 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pending Match Requests
        </h1>
        <p className="text-xs font-medium text-slate-400">
          Daftar pengguna yang ingin terhubung dan belajar bersama denganmu.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="overflow-hidden border-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] rounded-[24px] bg-white dark:bg-slate-900"
            >
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 rounded-full" />
                  <Skeleton className="h-9 w-20 rounded-full" />
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
            onClick={fetchPendingPartners}
            className="mt-4 gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && requests.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-0 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[28px] bg-white dark:bg-slate-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4f39f6]/10 text-[#4f39f6]">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
            Tidak Ada Permintaan Baru
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Belum ada permintaan match yang tertunda saat ini.
          </p>
        </Card>
      )}

      {/* Requests List */}
      {!loading && !error && requests.length > 0 && (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <Card
              key={`request-${req.matchId}`}
              className="border-0 shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,57,246,0.08)] rounded-[24px] transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3.5">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={req.avatar_url} alt={req.full_name} />
                    <AvatarFallback className="bg-[#4f39f6]/10 text-xs font-bold text-[#4f39f6]">
                      {getInitials(req.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                      {req.full_name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">
                      @{req.username}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 sm:border-t-0 sm:pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full px-3.5 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Link href={`/dashboard/profile/${req.username}`}>
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 rounded-full px-4 text-xs font-semibold bg-[#4f39f6] hover:bg-[#432ecb] text-white shadow-md shadow-[#4f39f6]/20 transition-all"
                    onClick={() => acceptRequest(req.matchId)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full px-4 text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                    onClick={() => rejectRequest(req.matchId)}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Reject
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
