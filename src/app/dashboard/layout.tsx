import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/layout/navbar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const metadata: Metadata = {
  title: "Dashboard | Salingbisa",
  description: "Salingbisa Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value; // sesuaikan nama cookie token kamu

  let avatarUrl: string | null = null;

  if (token) {
    try {
      // Decode JWT token untuk mengambil data payload
      const decoded = jwt.decode(token) as { avatar_url?: string } | null;
      avatarUrl = decoded?.avatar_url || null;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-950 flex flex-col">
      <Navbar avatarUrl={avatarUrl} />

      <main className="flex-1 flex flex-col pt-14">{children}</main>
    </div>
  );
}
