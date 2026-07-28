import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Props) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  const { id } = await params;
  let { status } = await request.json();

  if (!id) {
    return NextResponse.json({ message: "Id not valid" }, { status: 400 });
  }

  if (!["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ message: "Status not valid" }, { status: 400 });
  }

  const { data, error: errorSupabase } = await supabaseAdmin
    .from("matches")
    .update({
      status,
    })
    .eq("id", id)
    .eq("user_b_id", user!.userId)
    .eq("status", "pending")
    .select("id, status")
    .single();

  if (errorSupabase) {
    return NextResponse.json(
      {
        message: errorSupabase
          ? errorSupabase.message
          : "Internal server error",
      },
      { status: 400 },
    );
  }

  const response = {
    message: "Success update data matches",
    data: {
      id: data.id,
      status: data.status,
    },
  };

  return NextResponse.json(response, { status: 200 });
}
