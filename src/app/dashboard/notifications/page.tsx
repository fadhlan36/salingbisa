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
  matchId: string; // ID dari transaksi match (untuk Accept/Reject)
  userId: string; // ID dari user yang meminta match
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

      // Hapus request yang sudah di-accept dari UI
      setRequests((prev) =>
        prev.filter((request) => request.matchId !== matchId),
      );
      mutate();
    } catch (error) {
      console.error("Error accepting match:", error);
    }
  };

  const rejectRequest = async (matchId: String) => {
    try {
      const response = await fetch(`/api/matches/requests/${matchId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept match");
      }

      // Hapus request yang sudah di-reject dari UI
      setRequests((prev) =>
        prev.filter((request) => request.matchId !== matchId),
      );
      mutate();
    } catch (error) {
      console.error("Error accepting match:", error);
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

      // 1. Ambil array items langsung dari json.data atau json
      let rawItems: any[] = [];
      if (Array.isArray(json.data)) {
        rawItems = json.data;
      } else if (Array.isArray(json)) {
        rawItems = json;
      } else if (json?.data?.data && Array.isArray(json.data.data)) {
        rawItems = json.data.data;
      }

      // 2. Normalisasi data
      const normalizedRequests: PendingRequest[] = rawItems
        .filter((item) => item && item.sender) // Pastikan item memiliki sender
        .map((item: any) => {
          // Jika sender berbentuk array (jika ada kasus lain), ambil item pertama. Jika object, pakai langsung.
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
    <section className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-20 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Pending Match Requests
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            List of users who sent you a match request.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingPartners}
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && requests.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No Requests Found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No pending match requests at the moment.
          </p>
        </Card>
      )}

      {/* Requests List */}
      {!loading && !error && requests.length > 0 && (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <Card
              key={`request-${req.matchId}`}
              className="transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
            >
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border border-blue-100">
                    <AvatarImage src={req.avatar_url} alt={req.full_name} />
                    <AvatarFallback className="bg-blue-50 text-sm font-bold text-blue-600">
                      {getInitials(req.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold leading-tight text-gray-900">
                      {req.full_name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      @{req.username}
                    </p>
                  </div>
                </div>

                {/* Action Buttons for Match Request */}
                <div className="flex w-full items-center gap-2 border-t border-gray-100 pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 gap-2 px-3 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:flex-none"
                  >
                    <Link href={`/dashboard/profile/${req.username}`}>
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 flex-1 gap-2 bg-blue-600 px-4 text-white hover:bg-blue-700 sm:flex-none"
                    onClick={() => acceptRequest(req.matchId)}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:flex-none"
                    onClick={() => rejectRequest(req.matchId)}
                  >
                    <X className="h-4 w-4" />
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
