import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/layout/navbar";
import { UserProvider } from "@/context/user-context";

export const metadata: Metadata = {
  title: "Dashboard | Salingbisa",
  description: "Salingbisa Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-950 flex flex-col">
      <UserProvider>
        <Navbar />

        <main className="flex-1 flex flex-col pt-14">{children}</main>
      </UserProvider>
    </div>
  );
}
