"use client";

import { useState } from "react";

function EditPasswordSection() {
  const [currentPassword, setCurentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "New password dan confirm password no suitable.",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await fetch("/api/user/update/password", {
        // Sesuaikan endpoint API kamu
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Failed to update password.",
        });
      } else {
        setMessage({
          type: "success",
          text: data.message || "Password succedd updated!",
        });
        // Reset form setelah berhasil
        setCurentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "An error happens while updating the password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Security & Password
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Update your password regularly to keep your account secure.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            name="curentPassword"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurentPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default EditPasswordSection;
