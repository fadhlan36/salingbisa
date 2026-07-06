import { Bell, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { ProfileDropDown } from "../common/profile-dropdown";

export default function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-40 h-20 py-4 bg-white px-8">
      <div className="flex">
        {/* Search */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-xl items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search skills or username"
                className="pl-10"
              />
            </div>

            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Right */}
        <div className="ml-8 flex items-center gap-5">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Bell className="h-5 w-5" />
          </Button>

          <ProfileDropDown />
        </div>
      </div>
    </header>
  );
}
