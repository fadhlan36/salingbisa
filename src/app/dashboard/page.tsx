// src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth"; // sesuaikan sama fungsi verify kamu
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let payload;
  try {
    payload = verifyToken(token); // { userId, email }
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Login sebagai: {payload?.email}</p>
    </div>
  );
}
