import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Star,
  Users,
  CheckCircle2,
} from "lucide-react";

export default async function ProfilePage() {
  // Verifikasi Auth dari Cookie
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

  // Data disesuaikan persis dengan tampilan gambar
  const user = {
    name: payload?.full_name || "Fadhlan Faidh",
    username: "@fadhlan.dev",
    location: "Yogyakarta, Indonesia",
    rating: 4.8,
    reviewsCount: 32,
    bioHeadline:
      "Web developer passionate about building useful products and sharing knowledge with others.",
    aboutMe:
      "I love building web applications and exploring new technologies. Let's learn and grow together!",
    avatar: "/king.png",
    isOnline: true,
    stats: {
      learningPartners: 12,
      successfulSessions: 48,
      averageRating: 4.8,
    },
    canHelpWith: [
      { name: "React", level: "Advanced", icon: "⚛️" },
      { name: "Next.js", level: "Advanced", icon: "▲" },
      { name: "Laravel", level: "Intermediate", icon: "🔴" },
      { name: "PostgreSQL", level: "Intermediate", icon: "🐘" },
    ],
    wantToLearn: [
      { name: "UI Design", level: "Beginner", icon: "🎨" },
      { name: "Bahasa Jepang", level: "Beginner", icon: "🏮" },
    ],
  };

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

        {/* Edit Profile Button */}
        <div className="flex justify-center md:justify-end">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
            <Pencil className="h-4 w-4 text-slate-500" />
            Edit Profile
          </button>
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
            <button className="text-sm font-medium text-indigo-600 hover:underline">
              Edit
            </button>
          </div>

          <div className="space-y-2.5">
            {user.canHelpWith.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                  {item.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* I Want to Learn Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">
              I Want to Learn
            </h2>
            <button className="text-sm font-medium text-indigo-600 hover:underline">
              Edit
            </button>
          </div>

          <div className="space-y-2.5">
            {user.wantToLearn.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                  {item.level}
                </span>
              </div>
            ))}
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
