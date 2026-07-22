"use client";

import { useState } from "react";
import { Pencil, X, Plus, Trash2 } from "lucide-react";

export interface SkillItem {
  name: string;
  level: string;
  icon?: string;
}

export interface ProfileFormData {
  name: string;
  username: string;
  location: string;
  bioHeadline: string;
  aboutMe: string;
  avatar?: string;
  canHelpWith?: SkillItem[];
  wantToLearn?: SkillItem[];
}

interface EditProfileModalProps {
  initialData: ProfileFormData;
  onSave?: (updatedData: ProfileFormData) => Promise<void> | void;
}

export default function EditProfileModal({
  initialData,
  onSave,
}: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData.name || "",
    username: initialData.username || "",
    location: initialData.location || "",
    bioHeadline: initialData.bioHeadline || "",
    aboutMe: initialData.aboutMe || "",
    avatar: initialData.avatar || "/king.png",
    canHelpWith: initialData.canHelpWith || [],
    wantToLearn: initialData.wantToLearn || [],
  });

  const [loading, setLoading] = useState(false);

  // State untuk input temporary penambahan Skill
  const [newHelpSkill, setNewHelpSkill] = useState({
    name: "",
    level: "Beginner",
    icon: "💡",
  });
  const [newLearnSkill, setNewLearnSkill] = useState({
    name: "",
    level: "Beginner",
    icon: "🎯",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (onSave) {
        await onSave(formData);
      } else {
        console.log("Updated profile data:", formData);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk Manipulasi Skill "I Can Help With"
  const addHelpSkill = () => {
    if (!newHelpSkill.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      canHelpWith: [...(prev.canHelpWith || []), newHelpSkill],
    }));
    setNewHelpSkill({ name: "", level: "Beginner", icon: "💡" });
  };

  const removeHelpSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      canHelpWith: prev.canHelpWith?.filter((_, i) => i !== index),
    }));
  };

  // Helper untuk Manipulasi Skill "I Want to Learn"
  const addLearnSkill = () => {
    if (!newLearnSkill.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      wantToLearn: [...(prev.wantToLearn || []), newLearnSkill],
    }));
    setNewLearnSkill({ name: "", level: "Beginner", icon: "🎯" });
  };

  const removeLearnSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      wantToLearn: prev.wantToLearn?.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      {/* Tombol Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
      >
        <Pencil className="h-4 w-4 text-slate-500" />
        Edit Profile
      </button>

      {/* Pop-up Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-5 border border-slate-100">
            {/* Header Modal */}
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

            {/* Form Edit */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Full Name
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
                    Username
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

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="/king.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Headline Bio
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

              {/* Section: I Can Help With */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  I Can Help With
                </label>

                {/* List Item Skill */}
                <div className="flex flex-wrap gap-2">
                  {formData.canHelpWith?.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border"
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                      <span className="text-slate-400">({item.level})</span>
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

                {/* Input Tambah Skill */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nama skill (e.g. React)"
                    value={newHelpSkill.name}
                    onChange={(e) =>
                      setNewHelpSkill({ ...newHelpSkill, name: e.target.value })
                    }
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={newHelpSkill.level}
                    onChange={(e) =>
                      setNewHelpSkill({
                        ...newHelpSkill,
                        level: e.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={addHelpSkill}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>

              {/* Section: I Want to Learn */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  I Want to Learn
                </label>

                {/* List Item Skill */}
                <div className="flex flex-wrap gap-2">
                  {formData.wantToLearn?.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border"
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                      <span className="text-slate-400">({item.level})</span>
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

                {/* Input Tambah Skill */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nama skill (e.g. Japanese)"
                    value={newLearnSkill.name}
                    onChange={(e) =>
                      setNewLearnSkill({
                        ...newLearnSkill,
                        name: e.target.value,
                      })
                    }
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={newLearnSkill.level}
                    onChange={(e) =>
                      setNewLearnSkill({
                        ...newLearnSkill,
                        level: e.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={addLearnSkill}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
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
