import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function authenticate(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    return {
      user: verifyToken(token),
      error: null,
    };
  } catch {
    return {
      user: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
}
