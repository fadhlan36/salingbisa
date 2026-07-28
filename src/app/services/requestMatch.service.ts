import { supabaseAdmin } from "@/lib/supabase/admin";

type MatchPending = {
  id: string;
  status: string;
  created_at: string;
  user_b: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
};

export async function getRequestMatch(userId: string) {
  const { data, error: errorSupabase } = await supabaseAdmin
    .from("match")
    .select(
      "id, user_b: users_matches_user_b_id_fkey(id,username,full_name,avatar_url), status, created_at",
    )
    .eq("user_a", userId)
    .eq("status", "pending")
    .overrideTypes<MatchPending[]>();

  if (errorSupabase) {
    throw new Error(
      errorSupabase ? errorSupabase.message : "Internal server error",
    );
  }

  const requestPending = (data as MatchPending[]).map((match) => ({
    id: match.id,
    status: match.status,
    created_at: match.created_at,
    user: {
      id: match.user_b.id,
      full_name: match.user_b.full_name,
      username: match.user_b.username,
      avatar_url: match.user_b.avatar_url,
    },
  }));

  return requestPending;
}
