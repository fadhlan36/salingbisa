"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/user-context"; // Import Hook Context

interface ProfileDropDownProps {
  avatarUrl?: string | null;
}

export function ProfileDropDown({
  avatarUrl: propAvatarUrl,
}: ProfileDropDownProps) {
  const router = useRouter();

  // Ambil avatarUrl dari Context jika ada
  const userContext = useUser();

  const currentAvatar = propAvatarUrl ?? userContext?.avatarUrl;
  const userAvatar =
    currentAvatar && currentAvatar.trim() !== "" ? currentAvatar : "/king.png";

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/auth/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full size-8 outline-none">
          <Avatar className="size-full cursor-pointer">
            <AvatarImage
              src={userAvatar}
              alt="Profile Avatar"
              className="object-cover"
            />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
              U
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
