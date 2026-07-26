import { supabaseAdmin } from "@/lib/supabase/admin";

type GetPartnerParams = {
  currentUserId?: string | null;
  search?: string | null;
  teach?: string | null;
  learn?: string | null;
  location?: string | null;
  page: number;
  limit: number;
};

export async function partnerService({
  currentUserId,
  search,
  teach,
  learn,
  location,
  page,
  limit,
}: GetPartnerParams) {
  let query = supabaseAdmin
    .from("partner_view")
    .select("*")
    .neq("id", currentUserId);

  if (search) {
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  if (teach) {
    query = query.contains("teach", [teach]);
  }

  if (learn) {
    query = query.contains("learn", [learn]);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
