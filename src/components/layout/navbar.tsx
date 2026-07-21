"use client";

import { Bell, Menu, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { ProfileDropDown } from "../common/profile-dropdown";
import { useSidebar } from "./sidebar-context";

export default function Navbar() {
  const { toggle } = useSidebar();

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
                placeholder="Search skills or username"
                className="pl-10"
              />
            </div>

            {/* Filter — teks di desktop, icon aja di mobile */}
            <Button variant="outline" className="hidden sm:inline-flex">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 sm:hidden"
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
    </header>
  );
}
