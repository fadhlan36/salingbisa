import { partnerService } from "@/app/services/partner.sevice";
import { authenticate } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error: errorAuth } = authenticate(request);

  if (errorAuth) {
    return NextResponse.json(errorAuth);
  }

  const searchParams = request.nextUrl.searchParams;

  const filters = {
    currentUserId: user?.userId,
    search: searchParams.get("search"),
    teach: searchParams.get("teach"),
    learn: searchParams.get("learn"),
    location: searchParams.get("location"),
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 10),
  };

  try {
    const partners = await partnerService(filters);

    return NextResponse.json({
      message: "Data berhasil diambil",
      data: partners,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
