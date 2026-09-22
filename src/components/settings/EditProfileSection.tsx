"use client";

import { useState, useEffect } from "react";

interface SkillItem {
  name: string;
  icon?: string;
}

function extractSkillNames(skillsInput?: unknown): string[] {
  if (!skillsInput) return [];

  let parsed = skillsInput;

  if (typeof skillsInput === "string") {
    try {
      parsed = JSON.parse(skillsInput);
    } catch {
      return skillsInput.trim() !== "" ? [skillsInput] : [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (typeof item === "string") return item;

      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;

        // Bentuk hasil join Supabase: { type, skills: { name } } atau { type, skill: { name } }
        const nested = record.skills || record.skill;
        if (nested && typeof nested === "object") {
          const nestedName = (nested as Record<string, unknown>).name;
          if (typeof nestedName === "string") return nestedName;
        }

        const directName =
          record.name || record.skill_name || record.title || record.name_skill;
        if (typeof directName === "string") return directName;
      }

      return "";
    })
    .filter((name): name is string => Boolean(name && name.trim() !== ""));
}

export default function EditProfileSection({ token }: { token: string }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bioHeadline: "",
    aboutMe: "",
  });

  // Menyimpan SELURUH data original dari server secara diam-diam.
  // Field yang tidak punya UI editing (location, skills, dll) tetap
  // dikirim balik persis seperti ini saat submit, supaya backend
  // (yang bersifat all-or-nothing update) tidak menghapusnya.
  const [originalData, setOriginalData] = useState<{
    location: string | null;
    teachSkill: string[];
    learnSkill: string[];
  }>({
    location: null,
    teachSkill: [],
    learnSkill: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. Fetch Profile Data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            Cookie: `token=${token}`,
          },
          cache: "no-store",
        });

        const result = await res.json();
        const data = result.data || {};
        const payload = result.payload || {};

        setFormData({
          name: data.full_name || payload?.full_name || "User",
          email: data.email || payload?.email || "",
          username: data.username
            ? `@${data.username.replace(/^@/, "")}`
            : payload?.email
              ? `@${payload.email.split("@")[0]}`
              : "@user",
          bioHeadline: data.bio || "Belum ada bio singkat.",
          aboutMe: data.about_me || "Belum ada informasi tentang profil ini.",
        });

        // Simpan diam-diam, tidak ditampilkan di form manapun
        setOriginalData({
          location: data.location ?? null,
          teachSkill: extractSkillNames(data.skill_teach),
          learnSkill: extractSkillNames(data.skill_learn),
        });
      } catch (err) {
        console.error("Gagal mengambil data profile:", err);
      } finally {
        setFetching(false);
      }
    }

    fetchProfile();
  }, [token]);

  // 2. Submit Updated Profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bodyData = new FormData();

      const cleanUsername = formData.username.replace(/^@/, "");

      // Field yang memang diedit lewat form ini
      bodyData.append("full_name", formData.name);
      bodyData.append("email", formData.email);
      bodyData.append("username", cleanUsername);
      bodyData.append("bio", formData.bioHeadline);
      bodyData.append("about_me", formData.aboutMe);

      // Field yang TIDAK ada UI-nya di form ini, dikirim balik persis
      // seperti nilai aslinya supaya tidak hilang/ditimpa null oleh backend.
      if (originalData.location !== null) {
        bodyData.append("location", originalData.location);
      }
      bodyData.append("teachSkill", JSON.stringify(originalData.teachSkill));
      bodyData.append("learnSkill", JSON.stringify(originalData.learnSkill));

      const res = await fetch("/api/user/update", {
        method: "PATCH",
        body: bodyData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        alert(`Gagal: ${responseData.error || "Gagal mengupdate profile"}`);
      } else {
        alert("Profil berhasil diperbarui!");

        // Sinkronkan originalData dengan hasil terbaru dari server,
        // supaya submit berikutnya tetap konsisten dengan data terkini
        const updated = responseData.data;
        if (updated) {
          setOriginalData({
            location: updated.location ?? null,
            teachSkill: extractSkillNames(updated.skill_teach),
            learnSkill: extractSkillNames(updated.skill_learn),
          });
        }
      }
    } catch (error) {
      console.error("Error submit:", error);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-xl p-4 text-slate-500 text-sm">
        Memuat data profil...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header Info */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Edit Profile
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Update your personal details and public profile information.
        </p>
      </div>

      {/* Form Edit */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Username
          </label>
          <input
            type="text"
            placeholder="@johndoe"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Bio / Headline */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Bio
          </label>
          <input
            type="text"
            placeholder="Software Engineer | Tech Enthusiast"
            value={formData.bioHeadline}
            onChange={(e) =>
              setFormData({ ...formData, bioHeadline: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* About Me */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            About Me
          </label>
          <textarea
            rows={4}
            placeholder="Tell us a little bit about yourself..."
            value={formData.aboutMe}
            onChange={(e) =>
              setFormData({ ...formData, aboutMe: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
