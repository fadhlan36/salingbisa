import type { Metadata } from "next";
import "../globals.css";
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

      <div className="lg:ml-64">
        <Navbar />

        <main className="pt-24 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
