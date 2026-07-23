"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: {
    full_name: string;
    email: string;
    username: string;
    location: string;
    bio: string;
    about_me: string;
    teachSkill: string[];
    learnSkill: string[];
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return { success: false, message: "Unauthorized: Token tidak ditemukan" };
    }

    try {
        const payload = {
            full_name: formData.full_name,
            email: formData.email,
            username: formData.username.replace(/^@/, ""),
            location: formData.location,
            bio: formData.bio,
            about_me: formData.about_me,
            teachSkill: formData.teachSkill || [],
            learnSkill: formData.learnSkill || [],
        };

        // Ambil host/domain aktif secara dinamis (mencegah error jika port bukan 3000)
        const headerList = await headers();
        const host = headerList.get("host") || "localhost:3000";
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const apiUrl = `${protocol}://${host}/api/user/update`;

        const res = await fetch(apiUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `token=${token}`,
            },
            body: JSON.stringify(payload),
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