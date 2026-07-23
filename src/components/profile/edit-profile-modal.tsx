"use client";

import { useState } from "react";
import { Pencil, X, Plus, Trash2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";

export interface ProfileFormData {
  name: string;
  email: string;
  username: string;
  location: string;
  bioHeadline: string;
  aboutMe: string;
  canHelpWith?: string[];
  wantToLearn?: string[];
}

interface EditProfileModalProps {
  initialData: ProfileFormData;
}

export default function EditProfileModal({
  initialData,
}: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData.name || "",
    email: initialData.email || "",
    username: initialData.username || "",
    location: initialData.location || "",
    bioHeadline: initialData.bioHeadline || "",
    aboutMe: initialData.aboutMe || "",
    canHelpWith: initialData.canHelpWith || [],
    wantToLearn: initialData.wantToLearn || [],
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Input temporary untuk skill
  const [newHelpSkill, setNewHelpSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");

  const handleOpenModal = () => {
    setFormData({
      name: initialData.name || "",
      email: initialData.email || "",
      username: initialData.username || "",
      location: initialData.location || "",
      bioHeadline: initialData.bioHeadline || "",
      aboutMe: initialData.aboutMe || "",
      canHelpWith: initialData.canHelpWith || [],
      wantToLearn: initialData.wantToLearn || [],
    });
    setErrorMessage("");
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        username: formData.username,
        location: formData.location,
        bio: formData.bioHeadline,
        about_me: formData.aboutMe,
        teachSkill: formData.canHelpWith || [],
        learnSkill: formData.wantToLearn || [],
      };

      const result = await updateProfile(payload);

      if (result.success) {
        setIsOpen(false);
      } else {
        setErrorMessage(result.message || "Gagal memperbarui profil.");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      setErrorMessage("Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  // Helper Tambah/Hapus Skill Teach
  const addHelpSkill = () => {
    if (!newHelpSkill.trim()) return;
    setFormData((prev) => ({
      ...prev,
      canHelpWith: [...(prev.canHelpWith || []), newHelpSkill.trim()],
    }));
    setNewHelpSkill("");
  };

  const removeHelpSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      canHelpWith: prev.canHelpWith?.filter((_, i) => i !== index),
    }));
  };

  // Helper Tambah/Hapus Skill Learn
  const addLearnSkill = () => {
    if (!newLearnSkill.trim()) return;
    setFormData((prev) => ({
      ...prev,
      wantToLearn: [...(prev.wantToLearn || []), newLearnSkill.trim()],
    }));
    setNewLearnSkill("");
  };

  const removeLearnSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      wantToLearn: prev.wantToLearn?.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
      >
        <Pencil className="h-4 w-4 text-slate-500" />
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bio (Headline)
                </label>
                <input
                  type="text"
                  value={formData.bioHeadline}
                  onChange={(e) =>
                    setFormData({ ...formData, bioHeadline: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  About Me
                </label>
                <textarea
                  rows={3}
                  value={formData.aboutMe}
                  onChange={(e) =>
                    setFormData({ ...formData, aboutMe: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <hr className="border-slate-100 my-2" />

              {/* Teach Skills Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  I Can Help With (Teach Skills)
                </label>

                <div className="flex flex-wrap gap-2">
                  {formData.canHelpWith?.map((skillName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border"
                    >
                      <span>💡 {skillName}</span>
                      <button
                        type="button"
                        onClick={() => removeHelpSkill(idx)}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nama skill (misal: React)"
                    value={newHelpSkill}
                    onChange={(e) => setNewHelpSkill(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addHelpSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addHelpSkill}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>

              {/* Learn Skills Section */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  I Want to Learn (Learn Skills)
                </label>

                <div className="flex flex-wrap gap-2">
                  {formData.wantToLearn?.map((skillName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border"
                    >
                      <span>🎯 {skillName}</span>
                      <button
                        type="button"
                        onClick={() => removeLearnSkill(idx)}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nama skill (misal: Python)"
                    value={newLearnSkill}
                    onChange={(e) => setNewLearnSkill(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLearnSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addLearnSkill}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
