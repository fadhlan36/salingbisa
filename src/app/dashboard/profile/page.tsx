import React from "react";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, Star, Lightbulb, Target } from "lucide-react";
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
import EditProfileModal from "@/components/profile/edit-profile-modal";

interface ApiProfileResponse {
  id?: string;
  full_name?: string;
  email?: string;
  username?: string;
  location?: string;
  about_me?: string;
  bio?: string;
  avatar_url?: string;
  is_online?: boolean;
  rating?: number;
  reviews_count?: number;
  skill_teach?: any;
  skill_learn?: any;
}

interface UserProfile {
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
  canHelpWith: string[];
  wantToLearn: string[];
}

// Helper untuk membangun base URL absolut dari header request saat ini.
async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/**
 * Helper untuk memproses data skill_teach & skill_learn.
 */
function formatSkillList(skillsInput?: any): string[] {
  if (!skillsInput) return [];

  let parsedSkills = skillsInput;

  if (typeof skillsInput === "string") {
    try {
      parsedSkills = JSON.parse(skillsInput);
    } catch {
      return [skillsInput];
    }
  }

  if (!Array.isArray(parsedSkills)) return [];

  return parsedSkills
    .map((item) => {
      if (typeof item === "string") return item;

      if (typeof item === "object" && item !== null) {
        const name =
          item.name ||
          item.skill_name ||
          item.title ||
          item.name_skill ||
          item.skill ||
          "";

        return name ? String(name) : null;
      }

      return null;
    })
    .filter((item): item is string => !!item && item.trim() !== "");
}

/**
 * Helper untuk memetakan nama skill ke React Icon dan warna kustomnya.
 */
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

  // Fallback default icon
  return {
    icon: <FaDatabase className="w-3.5 h-3.5" />,
    color: "text-slate-400",
  };
}

async function getUserProfile(
  token: string,
  payload: any,
): Promise<UserProfile> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const result = await res.json();
      const firstItem = Array.isArray(result) ? result[0] : result;
      const data: ApiProfileResponse = firstItem?.data || firstItem;

      if (data) {
        return {
          name: data.full_name || payload?.full_name || "User",
          email: data.email || payload?.email || "",
          username: data.username
            ? `@${data.username.replace(/^@/, "")}`
            : payload?.email
              ? `@${payload.email.split("@")[0]}`
              : "@user",
          location: data.location || "Lokasi belum diatur",
          rating: data.rating ?? 0,
          reviewsCount: data.reviews_count ?? 0,
          bioHeadline: data.bio || "Belum ada bio singkat.",
          aboutMe: data.about_me || "Belum ada informasi tentang profil ini.",
          avatar: data.avatar_url || (data as any).avatar || "/profile.jpg",
          isOnline: data.is_online ?? true,
          canHelpWith: formatSkillList(data.skill_teach),
          wantToLearn: formatSkillList(data.skill_learn),
        };
      }
    }
  } catch (error) {
    console.error("Error fetching profile API:", error);
  }

  return {
    name: payload?.full_name || "User",
    email: payload?.email || "",
    username: payload?.email ? `@${payload.email.split("@")[0]}` : "@user",
    location: "Belum diatur",
    rating: 0,
    reviewsCount: 0,
    bioHeadline: "Tambahkan deskripsi singkat profil kamu.",
    aboutMe: "Tambahkan informasi lengkap tentang dirimu.",
    avatar: "/profile.jpg",
    isOnline: true,
    canHelpWith: [],
    wantToLearn: [],
  };
}

export default async function ProfilePage() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/auth/login");
  }

  const user = await getUserProfile(token, payload);

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-800">
      {/* 1. Back Button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* 2. Top Profile Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Online Badge */}
          <div className="relative">
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

          {/* User Info */}
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

        {/* Edit Profile Button Modal Component */}
        <div className="flex justify-center md:justify-end">
          <EditProfileModal
            initialData={{
              name: user.name,
              email: user.email,
              username: user.username,
              location: user.location,
              bioHeadline: user.bioHeadline,
              aboutMe: user.aboutMe,
              avatarUrl: user.avatar,
              canHelpWith: user.canHelpWith,
              wantToLearn: user.wantToLearn,
            }}
          />
        </div>
      </div>

      {/* 3. Skills Section (Modern Minimalist Pill Badges Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* I Can Help With Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-900 text-base">
              I Can Help With
            </h2>
          </div>

          {user.canHelpWith.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.canHelpWith.map((skill, index) => {
                const { icon, color } = getSkillIconAndColor(skill);
                return (
                  <div
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-default"
                  >
                    <span
                      className={`${color} flex items-center justify-center`}
                    >
                      {icon}
                    </span>
                    <span>{skill}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Belum menambahkan skill yang dikuasai.
            </p>
          )}
        </div>

        {/* I Want to Learn Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-900 text-base">
              I Want to Learn
            </h2>
          </div>

          {user.wantToLearn.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.wantToLearn.map((skill, index) => {
                const { icon, color } = getSkillIconAndColor(skill);
                return (
                  <div
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-default"
                  >
                    <span
                      className={`${color} flex items-center justify-center`}
                    >
                      {icon}
                    </span>
                    <span>{skill}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Belum menambahkan skill yang ingin dipelajari.
            </p>
          )}
        </div>
      </div>

      {/* 4. About Me Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-base">About Me</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{user.aboutMe}</p>
      </div>
    </div>
  );
}
