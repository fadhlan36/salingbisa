"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ProfileDropDown } from "../common/profile-dropdown";
import { useSidebar } from "./sidebar-context";

export default function Navbar() {
  const { toggle } = useSidebar();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [teach, setTeach] = useState("");
  const [learn, setLearn] = useState("");
  const [location, setLocation] = useState("");

  const buildParams = () => {
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (teach.trim()) params.set("teach", teach.trim());
    if (learn.trim()) params.set("learn", learn.trim());
    if (location.trim()) params.set("location", location.trim());
    return params;
  };

  const goToSearch = () => {
    const params = buildParams();
    router.push(`/dashboard/search?${params.toString()}`);
  };

  // Debounce: redirect otomatis 400ms setelah user berhenti mengetik
  useEffect(() => {
    // Jangan redirect kalau semua field masih kosong (misal pas awal load)
    if (!searchValue.trim() && !teach && !learn && !location) return;

    const timeout = setTimeout(() => {
      goToSearch();
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const applyFilter = () => {
    goToSearch();
    setFilterOpen(false);
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
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToSearch();
                  }
                }}
                placeholder="Search skills or username"
                className="pl-10"
              />
            </div>

            {/* Filter — teks di desktop, icon aja di mobile */}
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

        {/* Right */}
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
              <Input
                id="teach"
                placeholder="misal: React"
                value={teach}
                onChange={(e) => setTeach(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learn">Skill yang ingin dipelajari</Label>
              <Input
                id="learn"
                placeholder="misal: UI/UX"
                value={learn}
                onChange={(e) => setLearn(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                placeholder="misal: Jakarta"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
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
