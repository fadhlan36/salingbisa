"use server";

import { cookies } from "next/headers";
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
        const res = await fetch("http://localhost:3000/api/user/update", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `token=${token}`,
            },
            body: JSON.stringify({
                full_name: formData.full_name,
                email: formData.email,
                username: formData.username.replace(/^@/, ""), // Menghapus '@' jika diketik user
                location: formData.location,
                bio: formData.bio,
                about_me: formData.about_me,
                teachSkill: formData.teachSkill,
                learnSkill: formData.learnSkill,
            }),
        });

        const result = await res.json();

        if (!res.ok) {
            return {
                success: false,
                message: result.error || "Gagal memperbarui profil",
            };
        }

        revalidatePath("/dashboard/profile");
        return { success: true, data: result.response?.data };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, message: "Terjadi kesalahan koneksi server." };
    }
}