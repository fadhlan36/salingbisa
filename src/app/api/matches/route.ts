import { getMathces } from "@/app/services/match.service";
import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Get data matches
export async function GET(request: NextRequest) {
  const { user, error } = authenticate(request);

  if (error) {
    return NextResponse.json(error);
  }

  try {
    const matches = await getMathces(user!.userId);

    const response = matches.map((match: any) => ({
      id: match.match_id,
      partner: {
        id: match.partner_id,
        username: match.username,
        full_name: match.full_name,
        avatar_url: match.avatar_url,
      },
      status: match.status,
    }));

    return NextResponse.json(
      {
        message: "Berhasil mengambil data matches",
        data: response,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// POST send request match
export async function POST(request: NextRequest) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 },
    );
  }

  if (userId === user!.userId) {
    return NextResponse.json(
      { message: "Tidak dapat mengirim request ke diri sendiri" },
      { status: 400 },
    );
  }

  const { data: receiver, error: receiverError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (receiverError) {
    return NextResponse.json(
      { message: "User tidak ditemukan" },
      { status: 404 },
    );
  }

  const { data: existingMatch } = await supabaseAdmin
    .from("matches")
    .select("id, status")
    .or(
      `and(user_a_id.eq.${user!.userId},user_b_id.eq.${userId}),and(user_a_id.eq.${userId},user_b_id.eq.${user!.userId})`,
    )
    .maybeSingle();

  if (existingMatch) {
    return NextResponse.json(
      { message: "Request match sudah ada" },
      { status: 409 },
    );
  }

  const { error: errorSendMatch } = await supabaseAdmin.from("matches").insert({
    user_a_id: user!.userId,
    user_b_id: receiver.id,
    status: "pending",
  });

  if (errorSendMatch) {
    return NextResponse.json(
      { message: errorSendMatch.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Request berhasil dikirimkan" },
    { status: 201 },
  );
}
