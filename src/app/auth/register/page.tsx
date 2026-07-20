"use client";

import { ErrorAlert } from "@/components/common/error-alert";
import { SuccessAlert } from "@/components/common/success-alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          fullName: username,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Gagal mendaftar. Silakan coba lagi.");
        return;
      } else {
        setSuccess("Berhasil mendaftar. Silakan login.");
        setTimeout(() => {
          router.replace("/auth/login");
        }, 1500);
      }
    } catch (error) {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full md:w-[55%] flex-col justify-center px-6 py-12 sm:px-12 md:px-16">
      <div className="mx-auto w-full max-w-sm">
        {/* Judul */}
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-8 tracking-wide">
          Register
        </h1>

        {/* Form Utama */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Input Email */}
          <Field>
            <FieldLabel
              htmlFor="username"
              className="text-sm font-semibold text-slate-700"
            >
              Username
            </FieldLabel>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <UserRound className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-indigo-200 text-slate-700 focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-400 bg-white shadow-indigo-100 text-sm outline-none transition-all shadow-sm"
                required
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </div>
          </Field>

          {/* Input Email */}
          <Field>
            <FieldLabel
              htmlFor="email"
              className="text-sm font-semibold text-slate-700"
            >
              Email
            </FieldLabel>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-indigo-200 text-slate-700 focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-400 bg-white shadow-indigo-100 text-sm outline-none transition-all shadow-sm"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
          </Field>

          {/* Input Password */}
          <Field>
            <FieldLabel
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Password
            </FieldLabel>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Eye className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-indigo-200 text-slate-700 focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-400 bg-white shadow-indigo-100 text-sm outline-none transition-all shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
          </Field>

          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message={success} />}

          {/* Tombol Log In Utama */}
          <Button
            variant="default"
            size="lg"
            disabled={loading}
            type="submit"
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-[0.98] mt-2"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        {/* Footer Registrasi */}
        <p className="mt-8 text-center text-xs font-medium text-slate-500">
          Do you have an account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-slate-700 hover:underline"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
