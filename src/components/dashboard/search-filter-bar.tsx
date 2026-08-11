"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, RotateCcw } from "lucide-react";

interface SearchFilterBarProps {
  initialSearch?: string;
  initialTeach?: string;
  initialLearn?: string;
  initialLocation?: string;
  availableTeachSkills: string[];
  availableLearnSkills: string[];
}

export default function SearchFilterBar({
  initialSearch = "",
  initialTeach = "",
  initialLearn = "",
  initialLocation = "",
  availableTeachSkills = [],
  availableLearnSkills = [],
}: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [teach, setTeach] = useState(initialTeach);
  const [learn, setLearn] = useState(initialLearn);
  const [location, setLocation] = useState(initialLocation);

  // State untuk toggle input kustom jika user ingin mengetik skill di luar opsi dropdown
  const [isCustomTeach, setIsCustomTeach] = useState(
    Boolean(initialTeach && !availableTeachSkills.includes(initialTeach)),
  );
  const [isCustomLearn, setIsCustomLearn] = useState(
    Boolean(initialLearn && !availableLearnSkills.includes(initialLearn)),
  );

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (teach.trim()) params.set("teach", teach.trim());
    else params.delete("teach");

    if (learn.trim()) params.set("learn", learn.trim());
    else params.delete("learn");

    if (location.trim()) params.set("location", location.trim());
    else params.delete("location");

    params.set("page", "1"); // Reset ke halaman 1

    router.push(`/dashboard/search?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    setTeach("");
    setLearn("");
    setLocation("");
    setIsCustomTeach(false);
    setIsCustomLearn(false);
    router.push("/dashboard/search");
  };

  return (
    <form
      onSubmit={handleApplyFilter}
      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Input Kata Kunci */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Kata Kunci / Nama
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Dropdown Teach Skill */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-500">
              Bisa Mengajar (Teach)
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomTeach(!isCustomTeach);
                setTeach("");
              }}
              className="text-[11px] text-indigo-600 hover:underline font-medium"
            >
              {isCustomTeach ? "Pilih dari list" : "+ Ketik manual"}
            </button>
          </div>

          {isCustomTeach ? (
            <input
              type="text"
              placeholder="Ketik skill mengajar..."
              value={teach}
              onChange={(e) => setTeach(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          ) : (
            <select
              value={teach}
              onChange={(e) => setTeach(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Semua Skill Mengajar --</option>
              {availableTeachSkills.map((skill) => (
                <option key={`teach-${skill}`} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Dropdown Learn Skill */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-500">
              Ingin Belajar (Learn)
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomLearn(!isCustomLearn);
                setLearn("");
              }}
              className="text-[11px] text-indigo-600 hover:underline font-medium"
            >
              {isCustomLearn ? "Pilih dari list" : "+ Ketik manual"}
            </button>
          </div>

          {isCustomLearn ? (
            <input
              type="text"
              placeholder="Ketik skill belajar..."
              value={learn}
              onChange={(e) => setLearn(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          ) : (
            <select
              value={learn}
              onChange={(e) => setLearn(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Semua Skill Belajar --</option>
              {availableLearnSkills.map((skill) => (
                <option key={`learn-${skill}`} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filter Lokasi */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Lokasi
          </label>
          <input
            type="text"
            placeholder="misal: Jakarta..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Filter className="h-3.5 w-3.5" />
          Terapkan Filter
        </button>
      </div>
    </form>
  );
}
