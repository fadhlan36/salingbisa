import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type PartnerRecommendation = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  teach: string[];
  learn: string[];
};

export async function GET(request: NextRequest) {
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  const { data, error } = await supabaseAdmin.rpc("partner_recommendation");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = (data as PartnerRecommendation[])
    .filter((partner) => partner.id !== user?.userId)
    .map((partner) => ({
      id: partner.id,
      avatar_url: partner.avatar_url,
      full_name: partner.full_name,
      teachSkill: partner.teach,
      learnSkill: partner.learn,
      match: "100%", // TODO: calculate match percentage
    }));

  return NextResponse.json(response);
}
