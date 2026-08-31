"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, Mail, UserRound, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { ErrorAlert } from "@/components/common/error-alert";
import { SuccessAlert } from "@/components/common/success-alert";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

type Mode = "select" | "login" | "register";

// ===================== FORM COMPONENTS (Dideklarasikan di luar AuthPage) =====================

interface FormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  username?: string;
  setUsername?: (val: string) => void;
  loading: boolean;
  error: string;
  success?: string;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchMode: (mode: Mode) => void;
}

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
  onSwitchMode,
}: FormProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        {/* Tombol kembali hanya muncul di mobile ketika mode login */}
        <button
          type="button"
          onClick={() => onSwitchMode("select")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors md:hidden"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 text-center">Login</h1>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field>
          <FieldLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Email
          </FieldLabel>
          <div className="relative mt-1 flex items-center">
            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
            <Input
              type="email"
              placeholder="example@gmail.com"
              className="w-full bg-transparent pl-7 pr-2 py-2 rounded-none border-0 border-b-2 border-slate-200 transition-colors text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </Field>

        <Field>
          <FieldLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Password
          </FieldLabel>
          <div className="relative mt-1 flex items-center">
            <Eye className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
            <Input
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent pl-7 pr-2 py-2 rounded-none border-0 border-b-2 border-slate-200 transition-colors text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </Field>

        {error && <ErrorAlert message={error} />}

        <Button
          disabled={loading}
          type="submit"
          className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 mt-2 cursor-pointer"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 pt-2">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchMode("register")}
          className="font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          Sign up here
        </button>
      </p>
    </>
  );
}

function RegisterForm({
  email,
  setEmail,
  password,
  setPassword,
  username = "",
  setUsername = () => {},
  loading,
  error,
  success,
  onSubmit,
  onSwitchMode,
}: FormProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2 md:hidden">
        <button
          type="button"
          onClick={() => onSwitchMode("select")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 text-center">
        Register
      </h1>

      <form className="space-y-3.5" onSubmit={onSubmit}>
        <Field className="mb-4">
          <FieldLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Username
          </FieldLabel>
          <div className="relative mt-1 flex items-center">
            <UserRound className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Username kamu"
              className="w-full bg-transparent pl-7 pr-2 py-2 rounded-none border-0 border-b-2 border-slate-200 transition-colors text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </Field>

        <Field className="mb-4">
          <FieldLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Email
          </FieldLabel>
          <div className="relative mt-1 flex items-center">
            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
            <Input
              type="email"
              placeholder="example@gmail.com"
              className="w-full bg-transparent pl-7 pr-2 py-2 rounded-none border-0 border-b-2 border-slate-200 transition-colors text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </Field>

        <Field className="mb-4">
          <FieldLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Password
          </FieldLabel>
          <div className="relative mt-1 flex items-center">
            <Eye className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
            <Input
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent pl-7 pr-2 py-2 rounded-none border-0 border-b-2 border-slate-200 transition-colors text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </Field>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        <Button
          disabled={loading}
          type="submit"
          className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 mt-2 cursor-pointer"
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 pt-1">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchMode("login")}
          className="font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          Log in here
        </button>
      </p>
    </>
  );
}

// ===================== HALAMAN UTAMA =====================

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("select");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  // Atur mode default berdasarkan layar desktop saat di-mount
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setMode("login");
    }
  }, []);

  const resetAlerts = () => {
    setError("");
    setSuccess("");
  };

  const handleSwitchMode = (newMode: Mode) => {
    setMode(newMode);
    resetAlerts();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName: username }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        handleSwitchMode("login");
      }, 1500);
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* ================= TAMPILAN DESKTOP (Selalu Login / Register langsung) ================= */}
      <div className="hidden md:block">
        <AnimatePresence mode="wait">
          {mode === "register" ? (
            <motion.div
              key="desktop-register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RegisterForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                username={username}
                setUsername={setUsername}
                loading={loading}
                error={error}
                success={success}
                onSubmit={handleRegisterSubmit}
                onSwitchMode={handleSwitchMode}
              />
            </motion.div>
          ) : (
            <motion.div
              key="desktop-login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                error={error}
                onSubmit={handleLoginSubmit}
                onSwitchMode={handleSwitchMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= TAMPILAN MOBILE (Dengan alur Select -> Login/Register) ================= */}
      <div className="block md:hidden">
        <AnimatePresence mode="wait">
          {mode === "select" && (
            <motion.div
              key="select-mode"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center space-y-5 py-2"
            >
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Welcome!
                </h1>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Please select an option below to continue to your account.
                </p>
              </div>

              <div className="w-full space-y-3 pt-1 max-w-xs mx-auto">
                <Button
                  onClick={() => handleSwitchMode("login")}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" /> Log In
                </Button>

                <Button
                  onClick={() => handleSwitchMode("register")}
                  variant="outline"
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-700 border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <UserPlus className="w-4 h-4 text-indigo-600" /> Create New
                  Account
                </Button>
              </div>
            </motion.div>
          )}

          {mode === "login" && (
            <motion.div
              key="login-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                error={error}
                onSubmit={handleLoginSubmit}
                onSwitchMode={handleSwitchMode}
              />
            </motion.div>
          )}

          {mode === "register" && (
            <motion.div
              key="register-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <RegisterForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                username={username}
                setUsername={setUsername}
                loading={loading}
                error={error}
                success={success}
                onSubmit={handleRegisterSubmit}
                onSwitchMode={handleSwitchMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
