import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type MatchUser = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
};

type MatchDetail = {
  id: string;
  status: string;
  created_at: string;
  user_a: MatchUser;
  user_b: MatchUser;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  const { id } = await params;

  const { data, error: errorSupabase } = await supabaseAdmin
    .from("matches")
    .select(
      "id, status, created_at, user_a: users!matches_user_a_id_fkey(id, username, full_name, email, avatar_url), user_b: users!matches_user_b_id_fkey(id, username, full_name, email, avatar_url)",
    )
    .or(`user_a_id.eq.${user!.userId},user_b_id.eq.${user!.userId}`)
    .eq("id", id)
    .single();

  if (errorSupabase) {
    return NextResponse.json(
      {
        message: errorSupabase
          ? errorSupabase.message
          : "Internal server error",
      },
      { status: 500 },
    );
  }

  const match = data as unknown as MatchDetail;

  const response = {
    message: "Success get data detail match",
    data: {
      id: match.id,
      status: match.status,
      created_at: match.created_at,
      user_a: {
        id: match.user_a.id,
        username: match.user_a.username,
        full_name: match.user_a.full_name,
        email: match.user_a.email,
        avatar_url: match.user_a.avatar_url,
      },
      user_b: {
        id: match.user_b.id,
        username: match.user_b.username,
        full_name: match.user_b.full_name,
        email: match.user_b.email,
        avatar_url: match.user_b.avatar_url,
      },
    },
  };

  return NextResponse.json(response, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  const { id } = await params;

  const { error: errorSupabase } = await supabaseAdmin
    .from("matches")
    .delete()
    .or(`user_a_id.eq.${user!.userId},user_b_id.eq.${user!.userId}`)
    .eq("id", id);

  if (errorSupabase) {
    return NextResponse.json(
      {
        message: errorSupabase
          ? errorSupabase.message
          : "Internal server error",
      },
      { status: 500 },
    );
  }

  const response = {
    message: "Success delete data match",
  };

  return NextResponse.json(response, { status: 200 });
}
