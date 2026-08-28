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

      {/* Menambahkan bg-[#f9fafb] dan min-h-screen agar background full sampai bawah */}
      <div className="lg:ml-64 min-h-screen bg-[#f9fafb] dark:bg-slate-950 flex flex-col">
        <Navbar />

        <main className="flex-1 mt-24 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
