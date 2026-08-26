"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Menu, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileDropDown } from "../common/profile-dropdown";
import { useSidebar } from "./sidebar-context";

const DEFAULT_SKILL_OPTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "UI/UX Design",
  "Node.js",
  "Tailwind CSS",
  "Machine Learning",
];

const LOCATION_OPTIONS = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Bali",
  "Remote",
];

function NavbarContent() {
  const { toggle } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialTeach = searchParams.get("teach") || "";
  const initialLearn = searchParams.get("learn") || "";
  const initialLocation = searchParams.get("location") || "";

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [filterOpen, setFilterOpen] = useState(false);
  const [teach, setTeach] = useState(initialTeach);
  const [learn, setLearn] = useState(initialLearn);
  const [location, setLocation] = useState(initialLocation);

  const [skillOptions, setSkillOptions] = useState<string[]>(
    DEFAULT_SKILL_OPTIONS,
  );

  // Ref untuk menampung timer debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch daftar skill dari API
  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch("/api/skill/recomendation");
        if (res.ok) {
          const data = await res.json();
          const extractedNames: string[] = data
            .map(
              (item: { skill_name?: string; name?: string }) =>
                item.skill_name || item.name,
            )
            .filter((name: string | undefined): name is string =>
              Boolean(name && name.trim() !== ""),
            );

          const uniqueSkills: string[] = Array.from(
            new Set<string>(extractedNames),
          );

          if (uniqueSkills.length > 0) {
            setSkillOptions(uniqueSkills);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil daftar skill untuk filter:", error);
      }
    }

    fetchSkills();
  }, []);

  // Sync state dengan URL Params jika URL berubah (Navigasi luar)
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
    setTeach(searchParams.get("teach") || "");
    setLearn(searchParams.get("learn") || "");
    setLocation(searchParams.get("location") || "");
  }, [searchParams]);

  // Cleanup timer saat unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const buildParams = (searchQuery: string) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (teach) params.set("teach", teach);
    if (learn) params.set("learn", learn);
    if (location) params.set("location", location);
    return params;
  };

  const goToSearch = (customSearch = searchValue) => {
    const params = buildParams(customSearch);
    const queryString = params.toString();
    const targetUrl = queryString
      ? `/dashboard/search?${queryString}`
      : `/dashboard/search`;

    router.push(targetUrl);
  };

  // Handler pengetikan manual pengguna + Debounce
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    // Hapus timer lama jika pengguna masih mengetik
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Buat timer baru untuk debounce
    debounceTimerRef.current = setTimeout(() => {
      goToSearch(value);
    }, 400);
  };

  const applyFilter = () => {
    goToSearch(searchValue);
    setFilterOpen(false);
  };

  const handleResetFilter = () => {
    setTeach("");
    setLearn("");
    setLocation("");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-20 bg-white px-4 sm:px-6 lg:left-64 lg:px-8">
      <div className="flex h-full items-center">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="mr-3 shrink-0 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        {/* Search */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-xl items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Jika tekan Enter, batalkan timer debounce lalu langsung jalankan search
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    goToSearch(searchValue);
                  }
                }}
                placeholder="Cari keahlian atau nama pengguna..."
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 sm:hidden"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Menu */}
        <div className="ml-3 flex shrink-0 items-center gap-3 sm:ml-8 sm:gap-5">
          <Button
            variant="ghost"
            size="icon"
            className="hidden cursor-pointer sm:inline-flex"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <ProfileDropDown />
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Partner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="teach">Skill yang diajarkan</Label>
              <Select value={teach} onValueChange={setTeach}>
                <SelectTrigger id="teach">
                  <SelectValue placeholder="Pilih skill yang diajarkan" />
                </SelectTrigger>
                <SelectContent>
                  {skillOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learn">Skill yang ingin dipelajari</Label>
              <Select value={learn} onValueChange={setLearn}>
                <SelectTrigger id="learn">
                  <SelectValue placeholder="Pilih skill yang dipelajari" />
                </SelectTrigger>
                <SelectContent>
                  {skillOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResetFilter}
              className="mr-auto text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
            <Button variant="outline" onClick={() => setFilterOpen(false)}>
              Batal
            </Button>
            <Button onClick={applyFilter}>Terapkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function NavbarFallback() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-20 bg-white px-4 sm:px-6 lg:left-64 lg:px-8">
      <div className="flex h-full items-center" />
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarContent />
    </Suspense>
  );
}
