import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | Salingbisa",
  description: "Salingbisa Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6 md:p-10">
      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl min-h-[600px]">
        <div className="flex w-full flex-col md:flex-row">
          {/* SISI KIRI: Banner Ilustrasi Pastel */}
          <div className="relative hidden w-full md:flex md:w-[45%] flex-col justify-between bg-indigo-100/50 p-8 m-4 rounded-2xl overflow-hidden">
            {/* Logo / Brand */}
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-[#E15B64]">
                <span className="text-indigo-700">SalingNgokang</span>
                {/* <span className="text-black">Bisa</span> */}
              </span>
              <span className="text-xl font-black text-indigo-700 -ml-1">
                .
              </span>
            </div>

            {/* Area Ilustrasi Utama */}
            {/* Catatan: Ganti src gambar ini dengan file ilustrasi karakter Anda sendiri jika ada */}
            <div className="relative my-auto flex flex-col items-center justify-center">
              <div className="w-full max-w-[500px] aspect-square rounded-full bg-indigo-200/50 flex items-center justify-center text-orange-700 font-medium text-center p-4">
                <img
                  src="/logo-salingbisa.png"
                  alt="Logo SalingBisa"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Elemen Dekoratif Kertas/Grafik di belakang */}
              <div className="absolute top-[-40px] right-2 w-24 h-32 bg-white rounded-xl shadow-md rotate-12 p-3 flex flex-col gap-2">
                <div className="w-full h-3 bg-slate-200 rounded"></div>
                <div className="w-3/4 h-3 bg-slate-200 rounded"></div>
                <div className="mt-auto flex items-end gap-1 h-12">
                  <div className="w-1/3 bg-slate-300 h-[40%] rounded-t"></div>
                  <div className="w-1/3 bg-[#E15B64] h-[90%] rounded-t"></div>
                  <div className="w-1/3 bg-slate-300 h-[60%] rounded-t"></div>
                </div>
              </div>
            </div>

            {/* Placeholder bawah agar seimbang */}
            <div className="h-6"></div>
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
