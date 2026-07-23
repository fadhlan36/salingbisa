import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, Star, Users, CheckCircle2 } from "lucide-react";
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
  stats?: {
    learning_partners?: number;
    successful_sessions?: number;
    average_rating?: number;
  };
  skill_teach?: any;
  skill_learn?: any;
}

interface SkillItem {
  name: string;
  icon: string;
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
  stats: {
    learningPartners: number;
    successfulSessions: number;
    averageRating: number;
  };
  canHelpWith: SkillItem[];
  wantToLearn: SkillItem[];
}

/**
 * Helper untuk memproses data skill_teach & skill_learn
 * Hanya mengambil Nama dan Icon
 */
function formatSkillList(
  skillsInput?: any,
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
        const name =
          item.name ||
          item.skill_name ||
          item.title ||
          item.name_skill ||
          item.skill ||
          "";

        if (!name) return null;

        return {
          name: String(name),
          icon: item.icon || defaultIcon,
        };
      }

      return null;
    })
    .filter(
      (item): item is SkillItem => item !== null && item.name.trim() !== "",
    );
}

async function getUserProfile(
  token: string,
  payload: any,
): Promise<UserProfile> {
  try {
    const res = await fetch("http://localhost:3000/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const result = await res.json();

      // Unnesting data dari format response [{ message, data }, { status }]
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
          avatar: data.avatar_url || "/profile.jpg",
          isOnline: data.is_online ?? true,
          stats: {
            learningPartners: data.stats?.learning_partners ?? 0,
            successfulSessions: data.stats?.successful_sessions ?? 0,
            averageRating: data.stats?.average_rating ?? 0,
          },
          canHelpWith: formatSkillList(data.skill_teach, "💡"),
          wantToLearn: formatSkillList(data.skill_learn, "🎯"),
        };
      }
    } else {
      console.error("Gagal mengambil data profil:", res.status, res.statusText);
    }
  } catch (error) {
    console.error("Error fetching profile API:", error);
  }

  // Fallback data
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
    stats: {
      learningPartners: 0,
      successfulSessions: 0,
      averageRating: 0,
    },
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
              canHelpWith: user.canHelpWith.map((item) => item.name),
              wantToLearn: user.wantToLearn.map((item) => item.name),
            }}
          />
        </div>
      </div>

      {/* 3. Middle Cards Section (3 Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* I Can Help With Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">
              I Can Help With
            </h2>
          </div>

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

        {/* I Want to Learn Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">
              I Want to Learn
            </h2>
          </div>

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

        {/* Stats Card */}
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

      {/* 4. About Me Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-base">About Me</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{user.aboutMe}</p>
      </div>
    </div>
  );
}
