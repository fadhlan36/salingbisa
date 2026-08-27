"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  UserPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface SkillItem {
  name: string;
  icon: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  location: string;
  rating: number;
  reviewsCount: number;
  bioHeadline: string;
  aboutMe: string;
  avatar: string;
  isOnline: boolean;
  isMatched: boolean;
  stats: {
    learningPartners: number;
    successfulSessions: number;
    averageRating: number;
  };
  canHelpWith: SkillItem[];
  wantToLearn: SkillItem[];
}

function formatSkillList(
  skillsInput?: unknown,
  defaultIcon: string = "💡",
): SkillItem[] {
  if (!skillsInput) return [];

  let parsedSkills = skillsInput;

  if (typeof skillsInput === "string") {
    try {
      parsedSkills = JSON.parse(skillsInput);
    } catch {
      return [{ name: skillsInput, icon: defaultIcon }];
    }
  }

  if (!Array.isArray(parsedSkills)) return [];

  return parsedSkills
    .map((item) => {
      if (typeof item === "string") {
        return { name: item, icon: defaultIcon };
      }

      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const name =
          record.name ||
          record.skill_name ||
          record.title ||
          record.name_skill ||
          record.skill ||
          "";

        if (!name) return null;

        return {
          name: String(name),
          icon: typeof record.icon === "string" ? record.icon : defaultIcon,
        };
      }

      return null;
    })
    .filter(
      (item): item is SkillItem => item !== null && item.name.trim() !== "",
    );
}

export default function PartnerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams.username;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cek query parameter ?isMatched=true
  const isMatchedFromQuery = searchParams.get("isMatched") === "true";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanUsername = decodeURIComponent(rawUsername).replace(/^@/, "");
      const res = await fetch(`/api/user/profile/${cleanUsername}`);

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User profile not found.");
        }
        throw new Error("Failed to load user profile.");
      }

      const json = await res.json();
      const firstItem = Array.isArray(json) ? json[0] : json;
      const data = firstItem?.data || firstItem;

      if (!data) {
        throw new Error("User data is empty.");
      }

      const apiMatchedStatus =
        Boolean(data.is_matched) ||
        Boolean(data.isMatched) ||
        Boolean(data.is_partner) ||
        Boolean(data.isPartner) ||
        data.status === "matched";

      const formattedProfile: UserProfile = {
        id: data.id || "",
        name: data.full_name || data.name || "User",
        email: data.email || "",
        username: data.username
          ? `@${data.username.replace(/^@/, "")}`
          : "@user",
        location: data.location || "Lokasi belum diatur",
        rating: data.rating ?? 0,
        reviewsCount: data.reviews_count ?? 0,
        bioHeadline: data.bio || "Belum ada bio singkat.",
        aboutMe: data.about_me || "Belum ada informasi tentang profil ini.",
        avatar: data.avatar_url || data.avatar || "/profile.jpg",
        isOnline: data.is_online ?? true,
        isMatched: isMatchedFromQuery || apiMatchedStatus,
        stats: {
          learningPartners: data.stats?.learning_partners ?? 0,
          successfulSessions: data.stats?.successful_sessions ?? 0,
          averageRating: data.stats?.average_rating ?? 0,
        },
        canHelpWith: formatSkillList(data.skill_teach, "💡"),
        wantToLearn: formatSkillList(data.skill_learn, "🎯"),
      };

      setUser(formattedProfile);
    } catch (err: unknown) {
      console.error("Error fetching partner profile:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMatch = async () => {
    if (!user?.id) return;

    setIsRequesting(true);

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await res.json();

      // Backend mengirim array: [{ message }, { status }]
      const messageObj = Array.isArray(data)
        ? data.find((item: { message?: string }) => item?.message)
        : null;

      const message = messageObj?.message;
      const isSuccess = res.ok;

      if (isSuccess) {
        toast.success(message || "Request match berhasil dikirim.");
        setIsPending(true);
      } else {
        toast.error(message || "Gagal mengirim request match.");
      }
    } catch (err) {
      console.error("Error requesting match:", err);
      toast.error("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    if (rawUsername) {
      fetchProfile();
    }
  }, [rawUsername]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-800">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="animate-pulse space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-32 w-32 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="h-7 w-48 bg-slate-200 rounded mx-auto sm:mx-0" />
              <div className="h-4 w-32 bg-slate-200 rounded mx-auto sm:mx-0" />
              <div className="h-4 w-64 bg-slate-200 rounded mx-auto sm:mx-0" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-100 rounded-2xl" />
            <div className="h-40 bg-slate-100 rounded-2xl" />
            <div className="h-40 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProfile}
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Profile Section */}
      {!loading && !error && user && (
        <>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
              <div className="relative shrink-0">
                <div className="h-32 w-32 rounded-full overflow-hidden border bg-slate-100">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {user.isOnline && (
                  <span className="absolute bottom-1 right-2 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-300">
                    Online
                  </span>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left max-w-lg">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {user.name}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {user.username}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {user.location}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">
                      {user.rating}
                    </span>{" "}
                    <span className="text-slate-500">
                      ({user.reviewsCount} reviews)
                    </span>
                  </span>
                </div>

                <p className="text-sm text-slate-600 pt-1 leading-relaxed">
                  {user.bioHeadline}
                </p>
              </div>
            </div>

            {/* Action Button: Send Message vs Request Match vs Pending */}
            <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-end pt-2 md:pt-0">
              {user.isMatched ? (
                <Link
                  href={`/dashboard/messages?userId=${user.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Link>
              ) : (
                <Button
                  type="button"
                  onClick={handleRequestMatch}
                  disabled={isRequesting || isPending}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 w-full sm:w-auto ${
                    isPending
                      ? "bg-amber-100 text-amber-700 border border-amber-300 cursor-not-allowed hover:bg-amber-100 focus:ring-amber-500/20"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500/20"
                  }`}
                >
                  {isRequesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPending ? (
                    <Loader2 className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {isPending ? "Pending" : "Request Match"}
                </Button>
              )}
            </div>
          </div>

          {/* Skill Cards & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 text-base">
                I Can Help With
              </h2>
              <div className="space-y-2.5">
                {user.canHelpWith.length > 0 ? (
                  user.canHelpWith.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">
                    Belum menambahkan skill yang dikuasai.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 text-base">
                I Want to Learn
              </h2>
              <div className="space-y-2.5">
                {user.wantToLearn.length > 0 ? (
                  user.wantToLearn.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">
                    Belum menambahkan skill yang ingin dipelajari.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {user.stats.learningPartners}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Learning Partners
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {user.stats.successfulSessions}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Successful Sessions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {user.stats.averageRating}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Average Rating
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-900 text-base">About Me</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {user.aboutMe}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
