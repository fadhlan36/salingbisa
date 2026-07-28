import { getIncomingRequest } from "@/app/services/getIncomingRequest.service";
import { authenticate } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  try {
    const incomingRequest = await getIncomingRequest(user!.userId);

    return NextResponse.json(
      {
        message: "Berhasil mengambil data request",
        data: incomingRequest,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
