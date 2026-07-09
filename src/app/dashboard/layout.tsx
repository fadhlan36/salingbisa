import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Dashboard | Salingbisa",
  description: "Salingbisa Dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className="font-sans">
      <Sidebar />

      <div className="ml-64">
        <Navbar />

        <main className="p-8 pl-10 mt-16">{children}</main>
      </div>
    </body>
  );
}
