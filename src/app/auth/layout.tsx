"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 p-0 md:p-10">
      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-none md:rounded-3xl bg-black md:bg-white shadow-xl min-h-dvh md:min-h-[600px] flex-col md:flex-row">
        {/* ================= SISI GAMBAR HERO ================= */}
        <div className="absolute inset-0 md:relative w-full h-[60svh] md:h-auto md:w-[45%] flex flex-col justify-between p-6 md:p-8 md:m-4 md:rounded-2xl overflow-hidden group shrink-0">
          <Image
            src="/anakKecil.jpg"
            alt="SalingNgokang Hero"
            fill
            priority
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 45vw"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black md:to-transparent z-0" />

          <div className="relative z-10 flex items-center gap-1 pt-2 md:pt-0">
            <span className="text-xl font-black tracking-tight drop-shadow-md">
              <span className="text-indigo-400">Saling</span>
              <span className="text-white md:text-white">Ngokang</span>
            </span>
            <span className="text-xl font-black text-indigo-400 -ml-1 drop-shadow-md">
              .
            </span>
          </div>

          <div className="relative z-10 hidden md:block h-6" />
        </div>

        {/* ================= SISI CONTAINER FORM / PILIHAN ================= */}
        <motion.div
          layout
          transition={{
            duration: 1, // Durasi container meluncur membesar
            ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier
          }}
          className="relative w-full md:flex-1 bg-white rounded-t-3xl md:rounded-none z-20 flex flex-col justify-end md:justify-center p-6 sm:p-10 mt-auto md:my-auto shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.3)] md:shadow-none overflow-hidden"
        >
          <div className="w-full max-w-sm mx-auto">
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
