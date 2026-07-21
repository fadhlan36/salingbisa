"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Users,
  MessageSquare,
  Bell,
  User,
  Settings,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const menus = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "My Partners", href: "/partners", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Overlay khusus mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 flex flex-col border-r shadow-lg bg-white transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-8">
          <h1 className="text-xl font-bold">
            <span className="text-indigo-600">Saling</span>
            <span className="text-black">Bisa</span>
          </h1>

          <button onClick={close} className="lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2 px-4 overflow-y-auto">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = pathname === menu.href;

            return (
              <Link
                key={menu.name}
                href={menu.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "font-bold bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{menu.name}</span>
                {menu.name === "Notifications" && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-6 text-sm text-gray-400">
          © 2026 SalingBisa
        </div>
      </aside>
    </>
  );
}
