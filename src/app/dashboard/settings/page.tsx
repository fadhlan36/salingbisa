"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import AboutSection from "@/components/settings/AboutSection";
import EditPasswordSection from "@/components/settings/EditPasswordSection";
import EditProfileSection from "@/components/settings/EditProfileSection";

type SettingTab = "edit-profile" | "edit-password" | "notification" | "about";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Default null agar konsisten antara SSR & Hydration
  const [activeTab, setActiveTab] = useState<SettingTab | null>(null);

  // Set default tab di desktop ketika komponen di-mount
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setActiveTab("edit-profile");
    }
  }, []);

  const handleSelectTab = (tab: SettingTab) => {
    setActiveTab(tab);
  };

  const handleBackToMenu = () => {
    setActiveTab(null);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/auth/login");
        router.refresh();
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-6 md:py-12 pb-24 sm:pb-12">
      {/* Mobile Back Button */}
      {activeTab !== null && (
        <div className="md:hidden flex items-center gap-3 mb-5">
          <button
            onClick={handleBackToMenu}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-bold text-slate-800 dark:text-white">
            Back to Settings
          </span>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6 md:items-stretch w-full">
        {/* ================= LEFT CONTAINER (MENU OPTIONS) ================= */}
        <div
          className={`w-full md:w-80 shrink-0 flex-col justify-between md:bg-white md:dark:bg-slate-900 md:border md:border-slate-200/80 md:dark:border-slate-800 md:rounded-3xl md:p-6 md:shadow-sm ${
            activeTab !== null ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="px-1">
              <h2 className="text-2xl md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage your account and preferences
              </p>
            </div>

            {/* My Account Group */}
            <div className="space-y-2">
              <p className="px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                My Account
              </p>
              <div className="bg-white dark:bg-slate-900/80 rounded-2xl md:bg-transparent border border-slate-100 dark:border-slate-800/80 md:border-none p-1.5 md:p-0 space-y-1 shadow-sm md:shadow-none">
                <button
                  onClick={() => handleSelectTab("edit-profile")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === "edit-profile"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        activeTab === "edit-profile"
                          ? "bg-white/20 text-white"
                          : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <span>Edit Profile</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === "edit-profile"
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  />
                </button>

                {/* <button
                  onClick={() => handleSelectTab("edit-password")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === "edit-password"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        activeTab === "edit-password"
                          ? "bg-white/20 text-white"
                          : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <span>Change Password</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === "edit-password"
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  />
                </button> */}
              </div>
            </div>

            {/* Application Group */}
            <div className="space-y-2">
              <p className="px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Application
              </p>
              <div className="bg-white dark:bg-slate-900/80 rounded-2xl md:bg-transparent border border-slate-100 dark:border-slate-800/80 md:border-none p-1.5 md:p-0 space-y-1 shadow-sm md:shadow-none">
                <button
                  onClick={() => handleSelectTab("notification")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === "notification"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        activeTab === "notification"
                          ? "bg-white/20 text-white"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <span>Notifications</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === "notification"
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Others Group */}
            <div className="space-y-2">
              <p className="px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Others
              </p>
              <div className="bg-white dark:bg-slate-900/80 rounded-2xl md:bg-transparent border border-slate-100 dark:border-slate-800/80 md:border-none p-1.5 md:p-0 space-y-1 shadow-sm md:shadow-none">
                <button
                  onClick={() => handleSelectTab("about")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === "about"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        activeTab === "about"
                          ? "bg-white/20 text-white"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      }`}
                    >
                      <Info className="w-4 h-4" />
                    </div>
                    <span>About Salingbisa</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === "about" ? "text-white" : "text-slate-400"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4 mt-6 border-t border-slate-200/60 dark:border-slate-800">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition-all"
            >
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <LogOut className="w-4 h-4" />
              </div>
              <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT CONTAINER (CONTENT DETAIL) ================= */}
        <div
          className={`flex-1 w-full md:bg-white md:dark:bg-slate-900 md:border md:border-slate-200/80 md:dark:border-slate-800 md:rounded-3xl md:p-8 md:shadow-sm md:min-h-[520px] ${
            activeTab === null ? "hidden md:block" : "block"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab || "empty"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "edit-profile" && <EditProfileSection token="" />}
              {activeTab === "edit-password" && <EditPasswordSection />}
              {/* {activeTab === "notification" && <NotificationSection />} */}
              {activeTab === "about" && <AboutSection />}

              {activeTab === null && (
                <div className="hidden md:flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                    <Info className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium">
                    Select an option from the left menu to edit.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
