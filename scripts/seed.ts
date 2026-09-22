import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ==== KONFIGURASI ====
const TOTAL_USERS = 30;
const DEFAULT_PASSWORD = "password123";

const LOCATIONS = [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Yogyakarta",
    "Medan",
    "Semarang",
    "Malang",
    "Denpasar",
];

function pickRandom<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Ambil skill yang SUDAH ADA di database, tanpa nambah skill baru
async function getExistingSkills(): Promise<Map<string, string>> {
    const { data: existingSkills, error } = await supabaseAdmin
        .from("skills")
        .select("id, name");

    if (error) {
        throw new Error(`Gagal ambil skill: ${error.message}`);
    }

    if (!existingSkills || existingSkills.length === 0) {
        throw new Error("Tabel skills masih kosong, seed user butuh minimal 1 skill.");
    }

    const skillMap = new Map<string, string>();
    existingSkills.forEach((s) => skillMap.set(s.name, s.id));
    return skillMap;
}

async function seed() {
    console.log("Mengambil skill yang tersedia di database...");
    const skillMap = await getExistingSkills();
    const allSkillNames = Array.from(skillMap.keys());

    console.log(`Ditemukan ${allSkillNames.length} skill:`, allSkillNames.join(", "));
    console.log(`Mulai seeding ${TOTAL_USERS} user...`);

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (let i = 0; i < TOTAL_USERS; i++) {
        const fullName = faker.person.fullName();
        const username = faker.internet
            .username({ firstName: fullName.split(" ")[0] })
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
        const email = faker.internet.email({ firstName: username }).toLowerCase();

        // 1. Insert user
        const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .insert({
                email,
                password_hash: passwordHash,
                full_name: fullName,
                username,
                location: faker.helpers.arrayElement(LOCATIONS),
                bio: faker.lorem.sentence({ min: 4, max: 8 }),
                about_me: faker.lorem.paragraph(),
                avatar_url: faker.image.avatarGitHub(),
            })
            .select("id")
            .single();

        if (userError || !user) {
            console.error(`Gagal insert user ke-${i + 1}:`, userError?.message);
            continue;
        }

        // 2. Pilih skill acak untuk "teach" (maksimal setengah dari skill yang ada)
        const maxPick = Math.max(1, Math.floor(allSkillNames.length / 2));
        const teachCount = faker.number.int({ min: 1, max: maxPick });
        const teachNames = pickRandom(allSkillNames, teachCount);

        // 3. Pilih skill acak untuk "learn" (dari sisa yang belum dipakai di teach)
        const remainingNames = allSkillNames.filter((s) => !teachNames.includes(s));
        const learnCount = Math.min(
            remainingNames.length,
            faker.number.int({ min: 1, max: maxPick })
        );
        const learnNames = pickRandom(remainingNames, learnCount);

        // 4. Insert ke user_skills, pakai skill_id dari skillMap
        const userSkillRows = [
            ...teachNames.map((name) => ({
                user_id: user.id,
                skill_id: skillMap.get(name),
                type: "teach",
            })),
            ...learnNames.map((name) => ({
                user_id: user.id,
                skill_id: skillMap.get(name),
                type: "learn",
            })),
        ];

        const { error: userSkillError } = await supabaseAdmin
            .from("user_skills")
            .insert(userSkillRows);

        if (userSkillError) {
            console.error(`Gagal insert user_skills untuk ${username}:`, userSkillError.message);
        }

        console.log(`✅ [${i + 1}/${TOTAL_USERS}] ${fullName} (@${username}) dibuat`);
    }

    console.log("Selesai seeding!");
}

seed().catch((err) => {
    console.error("Seed gagal total:", err);
    process.exit(1);
});