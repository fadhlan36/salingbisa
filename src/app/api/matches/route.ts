import { getMathces } from "@/app/services/match.service";
import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error } = authenticate(request);

  if (error) {
    return NextResponse.json(error);
  }

  try {
    const matches = await getMathces(user!.userId);
    const response = {
      id: matches.id,
      username: matches.username,
      full_name: matches.full_name,
      avatar_url: matches.avatar_url,
    };

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
