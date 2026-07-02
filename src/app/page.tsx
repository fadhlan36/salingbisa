import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { error } = await supabase.from("_test").select("*").limit(1);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Kitabisa 🚀</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Status koneksi Supabase:{" "}
          {error ? `Ada pesan (${error.message})` : "Connected ✅"}
        </p>
      </div>
    </main>
  );
}
