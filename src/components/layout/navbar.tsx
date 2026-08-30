"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { ProfileDropDown } from "../common/profile-dropdown";

import {
  RiHome5Line,
  RiHome5Fill,
  RiCompass3Line,
  RiCompass3Fill,
  RiGroupLine,
  RiGroupFill,
  RiMessage3Line,
  RiMessage3Fill,
  RiSearchLine,
  RiXtzLine,
  RiNotification3Line,
} from "react-icons/ri";
import { useBadgeCount } from "@/app/hooks/useBadgeCount";

export const NAV_MOBILE = [
  {
    name: "Explore",
    href: "/dashboard/explore",
    iconOutline: RiCompass3Line,
    iconSolid: RiCompass3Fill,
  },
  {
    name: "My Partners",
    href: "/dashboard/my-partners",
    iconOutline: RiGroupLine,
    iconSolid: RiGroupFill,
  },
  {
    name: "Home",
    href: "/dashboard",
    iconOutline: RiHome5Line,
    iconSolid: RiHome5Fill,
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    iconOutline: RiMessage3Line,
    iconSolid: RiMessage3Fill,
  },
];

const NAV_MENUS = [
  { name: "Home", href: "/dashboard", icon: RiHome5Line },
  { name: "Explore", href: "/dashboard/explore", icon: RiCompass3Line },
  {
    name: "My Partners",
    href: "/dashboard/my-partners",
    icon: RiGroupLine,
  },
  { name: "Messages", href: "/dashboard/messages", icon: RiMessage3Line },
];

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { count } = useBadgeCount();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto focus ke input saat search terbuka
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Deteksi klik di luar container input search untuk menutupnya
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const goToSearch = (customSearch = searchValue) => {
    const params = new URLSearchParams();
    if (customSearch.trim()) params.set("search", customSearch.trim());
    const queryString = params.toString();
    const targetUrl = queryString
      ? `/dashboard/search?${queryString}`
      : `/dashboard/search`;

    router.push(targetUrl);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      goToSearch(value);
    }, 400);
  };

  return (
    <>
      {/* HEADER ATAS (Top Bar) */}
      <header className="fixed left-0 right-0 top-0 z-40 py-3 border-b bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
          {/* Brand Logo - Sembunyi di mobile jika search aktif */}
          <Link
            href="/dashboard"
            className={cn("shrink-0", isSearchOpen && "hidden md:block")}
          >
            <h1 className="text-xl font-bold">
              <span className="text-indigo-600">Saling</span>
              <span className="text-black">Bisa</span>
            </h1>
          </Link>

          {/* Desktop Nav Links */}
          {!isSearchOpen && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {NAV_MENUS.map((menu) => {
                const Icon = menu.icon;
                const active =
                  menu.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(menu.href);

                return (
                  <Link
                    key={menu.name}
                    href={menu.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-indigo-700 font-semibold"
                        : "text-gray-600 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{menu.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Search Input Bar - Mengambil full width & terpusat di tengah */}
          {isSearchOpen && (
            <div
              ref={searchContainerRef}
              className="flex w-full md:w-auto md:flex-1 justify-center max-w-lg mx-auto items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="relative w-full">
                <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                      }
                      goToSearch(searchValue);
                    } else if (e.key === "Escape") {
                      setIsSearchOpen(false);
                    }
                  }}
                  placeholder="Search skills or name..."
                  className="pl-9 h-9 text-sm pr-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm shadow-black/20 focus:shadow-black/30 transition-shadow w-full"
                />
                {searchValue && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <RiXtzLine className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Side: Search Icon Trigger, Notification & Profile Dropdown */}
          <div
            className={cn(
              "flex shrink-0 items-center gap-2",
              isSearchOpen && "hidden md:flex",
            )}
          >
            {/* 1. Search Icon Trigger */}
            {!isSearchOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-gray-600 hover:bg-transparent hover:text-gray-900 cursor-pointer flex items-center justify-center shrink-0"
                onClick={() => setIsSearchOpen(true)}
              >
                <RiSearchLine className="h-5 w-5" />
              </Button>
            )}

            {/* 2. Notification Button */}
            <Link href="/dashboard/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full text-gray-600 hover:bg-transparent hover:text-gray-900 cursor-pointer flex items-center justify-center shrink-0"
              >
                <RiNotification3Line className="h-5 w-5" />

                {/* Badge angka dari hook useBadgeCount */}
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in duration-150">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Button>
            </Link>

            {/* 3. Profile DropDown (Hanya muncul di Desktop) */}
            <div className="hidden md:flex items-center justify-center shrink-0">
              <ProfileDropDown />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Navigasi di Bawah Layar HP) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md py-2 px-3 md:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_MOBILE.map((menu) => {
            const active =
              menu.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(menu.href);

            // Otomatis memilih ikon Solid/Fill saat aktif & Line saat non-aktif
            const Icon = active ? menu.iconSolid : menu.iconOutline;

            return (
              <Link
                key={menu.name}
                href={menu.href}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
                  active
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                <Icon className="h-6 w-6 shrink-0 transition-transform duration-200 active:scale-90" />
              </Link>
            );
          })}

          {/* Profile DropDown disamakan ukurannya agar sejajar presisi */}
          <div className="flex h-9 w-9 items-center justify-center shrink-0">
            <ProfileDropDown />
          </div>
        </div>
      </nav>
    </>
  );
}

function NavbarFallback() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-16 bg-white px-4 sm:px-6 lg:px-8">
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
