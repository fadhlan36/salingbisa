"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return { success: false, message: "Unauthorized: Token tidak ditemukan" };
    }

    try {
        // Ambil data teks satu per satu dari FormData asal
        const fullName = formData.get("full_name") as string || "";
        const email = formData.get("email") as string || "";
        const usernameRaw = formData.get("username") as string || "";
        const cleanUsername = usernameRaw.replace(/^@/, "");
        const location = formData.get("location") as string || "";
        const bio = formData.get("bio") as string || "";
        const aboutMe = formData.get("about_me") as string || "";
        const teachSkill = formData.get("teachSkill") as string || "[]";
        const learnSkill = formData.get("learnSkill") as string || "[]";
        const avatarFile = formData.get("avatar") as File | null;

        // Buat instance FormData baru khusus untuk dikirim via fetch ke API Route
        const dataToSend = new FormData();
        dataToSend.append("full_name", fullName);
        dataToSend.append("email", email);
        dataToSend.append("username", cleanUsername);
        dataToSend.append("location", location);
        dataToSend.append("bio", bio);
        dataToSend.append("about_me", aboutMe);
        dataToSend.append("teachSkill", teachSkill);
        dataToSend.append("learnSkill", learnSkill);

        // Pastikan file avatar benar-benar dilampirkan ulang jika ada
        if (avatarFile && avatarFile.size > 0) {
            dataToSend.append("avatar", avatarFile);
        }

        const headerList = await headers();
        const host = headerList.get("host") || "localhost:3000";
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const apiUrl = `${protocol}://${host}/api/user/update`;

        const res = await fetch(apiUrl, {
            method: "PATCH",
            headers: {
                Cookie: `token=${token}`,
            },
            body: dataToSend,
        });

        const result = await res.json();

        if (!res.ok) {
            return {
                success: false,
                message: result?.error || "Gagal memperbarui profil",
            };
        }

        revalidatePath("/dashboard/profile");
        revalidatePath("/profile");

        const profileData = result?.response?.data || result?.data;

        return { success: true, data: profileData };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, message: "Terjadi kesalahan koneksi server." };
    }
}