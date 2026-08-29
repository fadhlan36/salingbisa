import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";

export const metadata: Metadata = {
  title: "Dashboard | Salingbisa",
  description: "Salingbisa Dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <Sidebar />

      <div className="lg:ml-64 min-h-screen bg-[#f9fafb] dark:bg-slate-950 flex flex-col">
        <Navbar />

        {/* main dibuat flex-1 & pt-16 (sesuai tinggi Navbar) tanpa padding/margin bawaan */}
        <main className="flex-1 flex flex-col pt-16">{children}</main>
      </div>
    </SidebarProvider>
  );
}
