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
} from "lucide-react";

import { cn } from "@/lib/utils";

const menus = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Explore",
    href: "/explore",
    icon: Search,
  },
  {
    name: "My Partners",
    href: "/partners",
    icon: Users,
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 flex flex-col border-r shadow-lg bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center px-8">
        <h1 className="text-2xl font-bold">
          <span className="text-violet-600">Skill</span>
          <span className="text-black">Swap</span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 px-4">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active = pathname === menu.href;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "font-bold bg-violet-100 text-violet-700"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              <Icon className="h-5 w-5" />

              <span>{menu.name}</span>

              {menu.name === "Notifications" && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-6 text-sm text-gray-400">© 2026 SkillSwap</div>
    </aside>
  );
}
