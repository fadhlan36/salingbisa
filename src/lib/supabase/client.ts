import { createClient } from "@supabase/supabase-js";

// Client ini khusus untuk sisi browser (Client Component), menggunakan
// anon key. Berbeda dengan supabaseAdmin (service role key di admin.ts)
// yang hanya boleh dipakai di server karena bypass RLS.
// Akses data lewat client ini tetap dibatasi oleh Row Level Security (RLS)
// yang sudah diaktifkan di tabel `messages`.
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);