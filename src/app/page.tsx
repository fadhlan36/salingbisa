import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Home() {
  const { error } = await supabaseAdmin.from("users").select("*").limit(1);

  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">SkillSwap 🚀</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Status koneksi Supabase:{" "}
          {error ? `Ada pesan (${error.message})` : "Connected ✅"}
        </p>
      </div>
    </section>
  );
}
