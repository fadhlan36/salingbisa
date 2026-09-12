import AuthClientLayout from "@/components/auth/auth-client-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | Salingbisa",
  description: "Salingbisa Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthClientLayout>{children}</AuthClientLayout>;
}
