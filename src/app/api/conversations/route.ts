import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Conversation = {
  id: string;
  partner: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  }[];
  last_message: {
    content: string;
    created_at: string;
  } | null;
};

export async function GET(request: NextRequest) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  const { data: matches, error: errorMatch } = await supabaseAdmin
    .from("matches")
    .select(
      `
        id,
        user_a_id,
        user_b_id,
        status,
        user_a:users!matches_user_a_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        user_b:users!matches_user_b_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `,
    )
    .or(`user_a_id.eq.${user!.userId},user_b_id.eq.${user!.userId}`)
    .eq("status", "accepted");

  if (errorMatch) {
    return NextResponse.json({ message: errorMatch.message }, { status: 500 });
  }

  const conversations: Conversation[] = await Promise.all(
    matches.map(async (match) => {
      const partner =
        match.user_a_id === user!.userId ? match.user_b : match.user_a;

      const { data: lastMessage, error: errorMessage } = await supabaseAdmin
        .from("messages")
        .select("content, created_at")
        .eq("match_id", match.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errorMessage) {
        throw new Error(errorMessage.message);
      }

      return {
        id: match.id,
        partner,
        last_message: lastMessage
          ? {
              content: lastMessage.content,
              created_at: lastMessage.created_at,
            }
          : null,
      };
    }),
  );

  return NextResponse.json(
    {
      message: "Success get conversations",
      data: conversations,
    },
    { status: 200 },
  );
}
