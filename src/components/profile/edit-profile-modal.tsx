"use client";

import React, { useState, useEffect } from "react";
import { Camera, Loader2, X, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SkillItemInput {
  name: string;
  icon?: string;
}

interface DatabaseSkill {
  id: string;
  skill_name: string;
  skillCount: number;
}

interface EditProfileModalProps {
  initialData: {
    name: string;
    email: string;
    username: string;
    location: string;
    bioHeadline: string;
    aboutMe: string;
    avatarUrl?: string;
    canHelpWith: (string | SkillItemInput)[];
    wantToLearn: (string | SkillItemInput)[];
  };
}

export default function EditProfileModal({
  initialData,
}: EditProfileModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const extractSkillNames = (skills: (string | SkillItemInput)[]) => {
    return skills
      .map((item) => (typeof item === "string" ? item : item.name))
      .filter((name): name is string => Boolean(name));
  };

  const [name, setName] = useState(initialData.name);
  const [username, setUsername] = useState(initialData.username);
  const [location, setLocation] = useState(initialData.location);
  const [bioHeadline, setBioHeadline] = useState(initialData.bioHeadline);
  const [aboutMe, setAboutMe] = useState(initialData.aboutMe);

  const [canHelpWith, setCanHelpWith] = useState<string[]>(
    extractSkillNames(initialData.canHelpWith),
  );
  const [wantToLearn, setWantToLearn] = useState<string[]>(
    extractSkillNames(initialData.wantToLearn),
  );

  const [availableSkills, setAvailableSkills] = useState<DatabaseSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    initialData.avatarUrl || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name);
      setUsername(initialData.username);
      setLocation(initialData.location);
      setBioHeadline(initialData.bioHeadline);
      setAboutMe(initialData.aboutMe);
      setCanHelpWith(extractSkillNames(initialData.canHelpWith));
      setWantToLearn(extractSkillNames(initialData.wantToLearn));
      setAvatarPreview(initialData.avatarUrl || "");
      setAvatarFile(null);

      const fetchSkills = async () => {
        setIsLoadingSkills(true);
        try {
          const res = await fetch("/api/skill");
          if (res.ok) {
            const result = await res.json();

            let rawList = [];
            if (Array.isArray(result)) {
              rawList = result;
            } else if (result && Array.isArray(result.data)) {
              rawList = result.data;
            } else if (result && Array.isArray(result.skills)) {
              rawList = result.skills;
            }

            const formattedSkills = rawList.map((item: any, idx: number) => ({
              id: item.id || item._id || String(idx),
              skill_name:
                item.skill_name || item.name || item.title || String(item),
              skillCount: item.skillCount || item.count || 0,
            }));

            setAvailableSkills(formattedSkills);
          }
        } catch (error) {
          console.error("Gagal mengambil list skill:", error);
        } finally {
          setIsLoadingSkills(false);
        }
      };

      fetchSkills();
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("full_name", name);
      formData.append("email", initialData.email);
      formData.append("username", username);
      formData.append("location", location);
      formData.append("about_me", aboutMe);
      formData.append("bio", bioHeadline);

      formData.append("teachSkill", JSON.stringify(canHelpWith));
      formData.append("learnSkill", JSON.stringify(wantToLearn));

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await fetch("/api/user/update", {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui profil");
      }

      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Gagal menyimpan profil:", error);
      alert(error.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
      >
        <Edit3 className="w-4 h-4" />
        Edit Profil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Edit Profil
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-left"
            >
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:flex-row gap-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-zinc-500">
                        {name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload-input"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Camera className="w-6 h-6" />
                  </label>
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Foto Profil
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Gunakan gambar berformat PNG, JPG, atau WEBP.
                  </p>
                  <label
                    htmlFor="avatar-upload-input"
                    className="inline-block mt-3 px-4 py-2 text-sm font-medium border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition"
                  >
                    Pilih Foto Baru
                  </label>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Bio Headline
                </label>
                <input
                  type="text"
                  value={bioHeadline}
                  onChange={(e) => setBioHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tentang Saya (About Me)
                </label>
                <textarea
                  rows={4}
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Dropdown Skill dengan Penanda & Disable jika sudah dipilih */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bisa Membantu */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Bisa Membantu (Pilih Skill)
                  </label>
                  <select
                    disabled={isLoadingSkills}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !canHelpWith.includes(val)) {
                        setCanHelpWith([...canHelpWith, val]);
                      }
                      e.target.value = "";
                    }}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">
                      {isLoadingSkills
                        ? "Memuat skill..."
                        : "-- Tambah Skill --"}
                    </option>
                    {availableSkills.map((s) => {
                      const isSelected = canHelpWith.includes(s.skill_name);
                      return (
                        <option
                          key={s.id}
                          value={s.skill_name}
                          disabled={isSelected}
                        >
                          {s.skill_name} {isSelected ? "✓ (Sudah dipilih)" : ""}
                        </option>
                      );
                    })}
                  </select>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {canHelpWith.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() =>
                            setCanHelpWith(
                              canHelpWith.filter((_, i) => i !== idx),
                            )
                          }
                          className="hover:text-red-500 ml-1 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ingin Belajar */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Ingin Belajar (Pilih Skill)
                  </label>
                  <select
                    disabled={isLoadingSkills}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !wantToLearn.includes(val)) {
                        setWantToLearn([...wantToLearn, val]);
                      }
                      e.target.value = "";
                    }}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">
                      {isLoadingSkills
                        ? "Memuat skill..."
                        : "-- Tambah Skill --"}
                    </option>
                    {availableSkills.map((s) => {
                      const isSelected = wantToLearn.includes(s.skill_name);
                      return (
                        <option
                          key={s.id}
                          value={s.skill_name}
                          disabled={isSelected}
                        >
                          {s.skill_name} {isSelected ? "✓ (Sudah dipilih)" : ""}
                        </option>
                      );
                    })}
                  </select>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {wantToLearn.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() =>
                            setWantToLearn(
                              wantToLearn.filter((_, i) => i !== idx),
                            )
                          }
                          className="hover:text-red-500 ml-1 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
