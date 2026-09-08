import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { uploadAvatarToCloudinary } from "@/lib/upload-avatar";

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = authenticate(request);

    if (authError) {
      return authError;
    }

    // =========================
    // 1. Parse FormData (bukan JSON lagi)
    // =========================
    const formData = await request.formData();

    const full_name = formData.get("full_name") as string | null;
    const email = formData.get("email") as string | null;
    const username = formData.get("username") as string | null;
    const location = formData.get("location") as string | null;
    const about_me = formData.get("about_me") as string | null;
    const bio = formData.get("bio") as string | null;
    const avatarFile = formData.get("avatar") as File | null;

    // teachSkill & learnSkill dikirim sebagai JSON string di dalam FormData
    const teachSkillRaw = formData.get("teachSkill") as string | null;
    const learnSkillRaw = formData.get("learnSkill") as string | null;

    let teachSkill: string[] = [];
    let learnSkill: string[] = [];

    try {
      teachSkill = teachSkillRaw ? JSON.parse(teachSkillRaw) : [];
      learnSkill = learnSkillRaw ? JSON.parse(learnSkillRaw) : [];
    } catch {
      return NextResponse.json(
        { error: "Format teachSkill/learnSkill tidak valid" },
        { status: 400 },
      );
    }

    if (!full_name || !email || !username) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    // =========================
    // 2. Upload avatar ke Cloudinary (kalau ada file baru)
    // =========================
    let avatar_url: string | undefined;

    if (avatarFile && avatarFile.size > 0) {
      // Validasi tipe file
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(avatarFile.type)) {
        return NextResponse.json(
          { error: "Format file harus JPG, PNG, atau WEBP" },
          { status: 400 },
        );
      }

      // Validasi ukuran file (maks 5MB)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (avatarFile.size > maxSizeBytes) {
        return NextResponse.json(
          { error: "Ukuran file maksimal 5MB" },
          { status: 400 },
        );
      }

      try {
        const uploadResult = await uploadAvatarToCloudinary(
          avatarFile,
          user!.userId,
        );
        avatar_url = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return NextResponse.json(
          { error: "Gagal mengunggah foto profil" },
          { status: 500 },
        );
      }
    }

    // =========================
    // 3. Update data user (termasuk avatar_url kalau ada upload baru)
    // =========================
    const updatePayload: Record<string, unknown> = {
      full_name,
      email,
      username,
      location,
      about_me,
      bio,
    };

    if (avatar_url) {
      updatePayload.avatar_url = avatar_url;
    }

    const { data: dataUser, error: errorUser } = await supabaseAdmin
      .from("users")
      .update(updatePayload)
      .eq("id", user!.userId)
      .select("full_name, email, username, location, about_me, bio, avatar_url")
      .single();

    if (errorUser) {
      return NextResponse.json({ error: errorUser.message }, { status: 500 });
    }

    // =========================
    // 4. Update skills (logic sama seperti sebelumnya)
    // =========================
    const { error: errorDeleteSkill } = await supabaseAdmin
      .from("user_skills")
      .delete()
      .eq("user_id", user!.userId);

    if (errorDeleteSkill) {
      return NextResponse.json(
        { error: errorDeleteSkill.message },
        { status: 500 },
      );
    }

    const allSkillNames = [...teachSkill, ...learnSkill];

    const { data: skillData, error: errorSkillData } = await supabaseAdmin
      .from("skills")
      .select("id, name")
      .in("name", allSkillNames);

    if (errorSkillData) {
      return NextResponse.json(
        { error: errorSkillData.message },
        { status: 500 },
      );
    }

    const skillMap = new Map(skillData.map((skill) => [skill.name, skill.id]));

    const missingSkills = allSkillNames.filter(
      (name: string) => !skillMap.has(name),
    );

    if (missingSkills.length > 0) {
      return NextResponse.json(
        {
          error: "Beberapa skill tidak ditemukan",
          missingSkills,
        },
        { status: 400 },
      );
    }

    const skills = [
      ...teachSkill.map((name: string) => ({
        user_id: user!.userId,
        skill_id: skillMap.get(name),
        type: "teach",
      })),
      ...learnSkill.map((name: string) => ({
        user_id: user!.userId,
        skill_id: skillMap.get(name),
        type: "learn",
      })),
    ];

    if (skills.length > 0) {
      const { error: errorInsertSkill } = await supabaseAdmin
        .from("user_skills")
        .insert(skills);

      if (errorInsertSkill) {
        return NextResponse.json(
          { error: errorInsertSkill.message },
          { status: 500 },
        );
      }
    }

    const { data: dataSkill, error: errorSkill } = await supabaseAdmin
      .from("user_skills")
      .select("type, skills(id, name)")
      .eq("user_id", user!.userId);

    if (errorSkill) {
      return NextResponse.json({ error: errorSkill.message }, { status: 500 });
    }

    // =========================
    // 5. Response
    // =========================
    const data = {
      full_name: dataUser.full_name,
      email: dataUser.email,
      username: dataUser.username,
      location: dataUser.location,
      about_me: dataUser.about_me,
      bio: dataUser.bio,
      avatar_url: dataUser.avatar_url,
      skill_teach: dataSkill.filter((skill) => skill.type === "teach"),
      skill_learn: dataSkill.filter((skill) => skill.type === "learn"),
    };

    return NextResponse.json(
      { message: "Profile sudah terupdate", data },
      { status: 200 },
    );
  } catch (err) {
    console.error("Unhandled error in PATCH /api/profile:", err);
    return NextResponse.json(
      {
        message: "Internal server error",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
