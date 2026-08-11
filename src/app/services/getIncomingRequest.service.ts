import { supabaseAdmin } from "@/lib/supabase/admin";

type MatchRequest = {
  id: string;
  status: string;
  created_at: string;
  user_a: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
};

export async function getIncomingRequest(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select(
      "id, user_a: users!matches_user_a_id_fkey(id,username,full_name,avatar_url), status, created_at",
    )
    .eq("user_b_id", userId)
    .eq("status", "pending")
    .overrideTypes<MatchRequest[]>();

  if (error) {
    throw new Error(error.message);
  }

  const response = (data as MatchRequest[]).map((match) => ({
    id: match.id,
    status: match.status,
    created_at: match.created_at,
    sender: match.user_a,
  }));

  return response;
}
