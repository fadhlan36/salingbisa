"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  MessageSquare,
  RefreshCw,
  UserPlus,
  Check,
  X,
  Loader2,
  Lightbulb,
  Target,
} from "lucide-react";
import {
  FaReact,
  FaJs,
  FaLaravel,
  FaPython,
  FaHtml5,
  FaCss3Alt,
  FaNodeJs,
  FaPhp,
  FaGitAlt,
  FaDocker,
  FaDatabase,
  FaPalette,
  FaChartLine,
  FaLightbulb,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiPostgresql,
  SiMysql,
  SiFlutter,
} from "react-icons/si";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface SkillItem {
  name: string;
  icon: React.ReactNode;
  color: string;
}

type MatchStatus = "none" | "pending" | "accepted";

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
  matchStatus: MatchStatus;
  matchId: string | null;
  isSender: boolean;
  canHelpWith: SkillItem[];
  wantToLearn: SkillItem[];
}

function getSkillIconAndColor(skillName: string): {
  icon: React.ReactNode;
  color: string;
} {
  const lower = skillName.toLowerCase().trim();

  if (
    lower.includes("ui/ux") ||
    lower.includes("uiux") ||
    lower.includes("design")
  ) {
    return {
      icon: <FaPalette className="w-3.5 h-3.5" />,
      color: "text-pink-500",
    };
  }
  if (lower.includes("market") || lower.includes("marketing")) {
    return {
      icon: <FaChartLine className="w-3.5 h-3.5" />,
      color: "text-emerald-500",
    };
  }
  if (lower.includes("investasi") || lower.includes("investment")) {
    return {
      icon: <FaLightbulb className="w-3.5 h-3.5" />,
      color: "text-amber-400",
    };
  }
  if (lower.includes("laravel")) {
    return {
      icon: <FaLaravel className="w-3.5 h-3.5" />,
      color: "text-red-500",
    };
  }
  if (lower.includes("next")) {
    return {
      icon: <SiNextdotjs className="w-3.5 h-3.5" />,
      color: "text-slate-800",
    };
  }
  if (lower.includes("react")) {
    return {
      icon: <FaReact className="w-3.5 h-3.5" />,
      color: "text-cyan-400",
    };
  }
  if (lower.includes("javascript") || lower === "js") {
    return { icon: <FaJs className="w-3.5 h-3.5" />, color: "text-yellow-400" };
  }
  if (lower.includes("typescript") || lower === "ts") {
    return {
      icon: <SiTypescript className="w-3.5 h-3.5" />,
      color: "text-blue-600",
    };
  }
  if (lower.includes("python")) {
    return {
      icon: <FaPython className="w-3.5 h-3.5" />,
      color: "text-blue-500",
    };
  }
  if (lower.includes("node")) {
    return {
      icon: <FaNodeJs className="w-3.5 h-3.5" />,
      color: "text-green-600",
    };
  }
  if (lower.includes("tailwind")) {
    return {
      icon: <SiTailwindcss className="w-3.5 h-3.5" />,
      color: "text-cyan-500",
    };
  }
  if (lower.includes("html")) {
    return {
      icon: <FaHtml5 className="w-3.5 h-3.5" />,
      color: "text-orange-600",
    };
  }
  if (lower.includes("css")) {
    return {
      icon: <FaCss3Alt className="w-3.5 h-3.5" />,
      color: "text-blue-500",
    };
  }
  if (lower.includes("php")) {
    return {
      icon: <FaPhp className="w-3.5 h-3.5" />,
      color: "text-indigo-500",
    };
  }
  if (lower.includes("git")) {
    return {
      icon: <FaGitAlt className="w-3.5 h-3.5" />,
      color: "text-red-500",
    };
  }
  if (lower.includes("docker")) {
    return {
      icon: <FaDocker className="w-3.5 h-3.5" />,
      color: "text-blue-400",
    };
  }
  if (lower.includes("postgresql")) {
    return {
      icon: <SiPostgresql className="w-3.5 h-3.5" />,
      color: "text-blue-700",
    };
  }
  if (lower.includes("mysql")) {
    return {
      icon: <SiMysql className="w-3.5 h-3.5" />,
      color: "text-blue-600",
    };
  }
  if (lower.includes("flutter")) {
    return {
      icon: <SiFlutter className="w-3.5 h-3.5" />,
      color: "text-cyan-400",
    };
  }

  return {
    icon: <FaDatabase className="w-3.5 h-3.5" />,
    color: "text-slate-400",
  };
}

function formatSkillList(skillsInput?: unknown): SkillItem[] {
  if (!skillsInput) return [];

  let parsedSkills = skillsInput;

  if (typeof skillsInput === "string") {
    try {
      parsedSkills = JSON.parse(skillsInput);
    } catch {
      const trimmed = skillsInput.trim();
      if (!trimmed) return [];
      const { icon, color } = getSkillIconAndColor(trimmed);
      return [{ name: trimmed, icon, color }];
    }
  }

  if (!Array.isArray(parsedSkills)) return [];

  return parsedSkills
    .map((item) => {
      let name = "";
      if (typeof item === "string") {
        name = item;
      } else if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        name = String(
          record.name ||
            record.skill_name ||
            record.title ||
            record.name_skill ||
            record.skill ||
            "",
        );
      }

      if (!name || name.trim() === "") return null;
      const cleanName = name.trim();
      const { icon, color } = getSkillIconAndColor(cleanName);
      return { name: cleanName, icon, color };
    })
    .filter((item): item is SkillItem => item !== null);
}

export default function PartnerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams.username;
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

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
        matchStatus: (data.match_status as MatchStatus) ?? "none",
        matchId: data.match_id ?? null,
        isSender: Boolean(data.is_sender),
        canHelpWith: formatSkillList(data.skill_teach),
        wantToLearn: formatSkillList(data.skill_learn),
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

      const messageObj = Array.isArray(data)
        ? data.find((item: { message?: string }) => item?.message)
        : null;

      const message = messageObj?.message || data?.message;
      const isSuccess = res.ok;

      if (isSuccess) {
        toast.success(message || "Request match berhasil dikirim.");
        await fetchProfile();
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

  const handleAcceptRequest = async () => {
    if (!user?.matchId) return;
    setIsResponding(true);

    try {
      const res = await fetch(`/api/matches/requests/${user.matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (!res.ok) throw new Error("Gagal menerima request match.");

      toast.success("Request match diterima.");
      await fetchProfile();
    } catch (err) {
      console.error("Error accepting match:", err);
      toast.error("Gagal menerima request match.");
    } finally {
      setIsResponding(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!user?.matchId) return;
    setIsResponding(true);

    try {
      const res = await fetch(`/api/matches/requests/${user.matchId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menolak request match.");

      toast.success("Request match ditolak.");
      await fetchProfile();
    } catch (err) {
      console.error("Error rejecting match:", err);
      toast.error("Gagal menolak request match.");
    } finally {
      setIsResponding(false);
    }
  };

  useEffect(() => {
    if (rawUsername) {
      fetchProfile();
    }
  }, [rawUsername]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-800 px-4 pt-8 pb-28 sm:px-6 lg:px-8 lg:pb-10">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Profile Section */}
      {!loading && !error && user && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
              <div className="relative shrink-0">
                <div className="h-32 w-32 rounded-full overflow-hidden border bg-slate-100 shadow-sm">
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
                </div>

                <p className="text-sm text-slate-600 pt-1 leading-relaxed">
                  {user.bioHeadline}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end justify-center pt-2 md:pt-0 gap-2">
              {user.matchStatus === "accepted" && (
                <Link
                  href={`/dashboard/messages?userId=${user.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-auto"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Link>
              )}

              {user.matchStatus === "pending" && user.isSender && (
                <Button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-none w-full sm:w-auto bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed hover:bg-slate-100"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Request Sent
                </Button>
              )}

              {/* Pending Received State (Matched Style to Image) */}
              {user.matchStatus === "pending" && !user.isSender && (
                <div className="flex flex-col items-center md:items-end gap-1.5 w-full sm:w-auto">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Accept Button: Solid Purple with subtle shadow & rounded-full */}
                    <Button
                      type="button"
                      onClick={handleAcceptRequest}
                      disabled={isResponding}
                      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex-1 sm:flex-initial"
                    >
                      {isResponding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      )}
                      Accept
                    </Button>

                    {/* Reject Button: Outline Red with rounded-full */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRejectRequest}
                      disabled={isResponding}
                      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-none flex-1 sm:flex-initial"
                    >
                      {isResponding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 stroke-[2.5]" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {user.matchStatus === "none" && (
                <Button
                  type="button"
                  onClick={handleRequestMatch}
                  disabled={isRequesting}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500/20"
                >
                  {isRequesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Request Match
                </Button>
              )}
            </div>
          </div>

          {/* Skill Cards (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-slate-400" />
                <h2 className="font-bold text-slate-900 text-base">
                  I Can Help With
                </h2>
              </div>

              {user.canHelpWith.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.canHelpWith.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-default"
                    >
                      <span
                        className={`${item.color} flex items-center justify-center`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum menambahkan skill yang dikuasai.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-400" />
                <h2 className="font-bold text-slate-900 text-base">
                  I Want to Learn
                </h2>
              </div>

              {user.wantToLearn.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.wantToLearn.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-default"
                    >
                      <span
                        className={`${item.color} flex items-center justify-center`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum menambahkan skill yang ingin dipelajari.
                </p>
              )}
            </div>
          </div>

          {/* About Me Section */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-900 text-base">About Me</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {user.aboutMe}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
