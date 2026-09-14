import { authenticate } from "@/lib/auth-helper";
import { getPartnerRecommendations } from "@/lib/partners";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  const recommendations = await getPartnerRecommendations(user!.userId);

  return NextResponse.json(recommendations);
}
