import { authenticate } from "@/lib/auth-helper";
import { getSkillRecommendations } from "@/lib/skills";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error: authError } = authenticate(request);

  if (authError) {
    return authError;
  }

  const recommendations = await getSkillRecommendations(user!.userId);

  return NextResponse.json(recommendations);
}
