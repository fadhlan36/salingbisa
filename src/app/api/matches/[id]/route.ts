import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

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
