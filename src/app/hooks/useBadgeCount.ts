// hooks/useBadgeCount.ts
"use client";
import useSWR from "swr";

interface MatchUser {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

interface MatchItem {
  message: string;
  data: {
    id: string;
    status: string;
    created_at: string;
    user: MatchUser;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBadgeCount() {
  const { data, mutate, isLoading } = useSWR("/api/matches/requests", fetcher, {
    revalidateOnFocus: false, // tidak fetch ulang saat window difokuskan lagi
    revalidateOnReconnect: false, // tidak fetch ulang saat internet reconnect
    revalidateIfStale: false, // tidak fetch ulang otomatis kalau dianggap stale
  });

  let matches: any[] = [];
  if (Array.isArray(data?.data)) {
    matches = data.data;
  } else if (Array.isArray(data)) {
    matches = data;
  } else if (Array.isArray(data?.data?.data)) {
    matches = data.data.data;
  }

  return {
    matches,
    count: matches.length,
    isLoading,
    mutate, // panggil ini setelah accept/reject
  };
}
