import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function authenticate(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unathorized" }, { status: 401 });
    }

    return { user: verifyToken(token), error: null };
  } catch (error) {
    return {
      user: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
}
