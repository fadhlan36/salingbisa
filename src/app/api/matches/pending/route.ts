import { getRequestMatch } from "@/app/services/requestMatch.service";
import { authenticate } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  try {
    const requestPending = getRequestMatch(user!.userId);

    return NextResponse.json(
      {
        message: "Success get data request pending",
        data: requestPending,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Server internal error",
      },
      { status: 500 },
    );
  }
}
