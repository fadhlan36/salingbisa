import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verify } from "crypto";
import { NextRequest, NextResponse } from "next/server";

type PartnerRecommendation = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  teach: string[];
  learn: string[];
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let user;

  try {
    user = verifyToken(token);
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data, error } = await supabaseAdmin.rpc("partner_recommendation");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const partners = (data as PartnerRecommendation[]).filter(
    (partner) => partner.id !== user?.userId,
  );

  const response = partners.map((item) => ({
    id: item.id,
    avatar_url: item.avatar_url,
    full_name: item.full_name,
    skill_teach: item.teach,
    skill_learn: item.learn,
    match: "100%",
  }));

  return NextResponse.json(response);
}
