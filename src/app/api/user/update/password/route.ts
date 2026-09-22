import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    // 1. Autentikasi User
    const { user, error: authError } = authenticate(request);
    if (authError) {
      return authError;
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const { currentPassword, newPassword, confirmPassword } =
      Object.fromEntries(formData);

    const currentPasswordStr = (currentPassword as string) || null;
    const newPasswordStr = (newPassword as string) || null;
    const confirmPasswordStr = (confirmPassword as string) || null;

    // 3. Validasi Field Kosong
    if (!currentPasswordStr || !newPasswordStr || !confirmPasswordStr) {
      return NextResponse.json(
        { message: "All field must be filled" },
        { status: 400 },
      );
    }

    // 4. Validasi Kesesuaian & Panjang Password Baru
    if (newPasswordStr !== confirmPasswordStr) {
      return NextResponse.json(
        { message: "New Password and confirm password not same" },
        { status: 400 },
      );
    }

    if (newPasswordStr.length < 6) {
      return NextResponse.json(
        { message: "Password min 6 char" },
        { status: 400 },
      );
    }

    // 5. Ambil User dari Supabase
    const { data: userLogin, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, email, password_hash")
      .eq("email", user?.email)
      .single();

    if (fetchError || !userLogin) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 6. Verifikasi Password Saat Ini (Cocokkan dengan Bcrypt)
    const isPasswordCorrect = await bcrypt.compare(
      currentPasswordStr,
      userLogin.password_hash,
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Current password is wrong" },
        { status: 400 },
      );
    }

    // 7. Hash Password Baru & Update ke Supabase
    const hashedPassword = await bcrypt.hash(newPasswordStr, 10);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", userLogin.id);

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 },
      );
    }

    // 8. Respon Sukses
    return NextResponse.json(
      { message: "Password berhasil diperbarui" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error updating password:", err);
    return NextResponse.json(
      {
        message: "Internal server error",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
