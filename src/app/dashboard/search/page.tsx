import Link from "next/link";
import { cookies, headers } from "next/headers";
import PartnerCard from "@/components/dashboard/partner-card";

interface PartnerSearchResult {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  teach: string[];
  learn: string[];
  location: string;
}

interface SearchApiResponse {
  message: string;
  data: PartnerSearchResult[];
  status: number;
}

// Helper untuk membangun base URL absolut dari header request saat ini.
// Diperlukan karena Server Component tidak bisa fetch dengan relative URL,
// dan hardcode localhost akan gagal saat production (Vercel).
async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

async function searchPartners(
  query: URLSearchParams,
  token: string,
): Promise<SearchApiResponse> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/partner?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch search results:", res.statusText);
      return { message: res.statusText, data: [], status: res.status };
    }

    return (await res.json()) as SearchApiResponse;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return { message: "Internal server error", data: [], status: 500 };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    window.location.href = "/auth/login";
    return;
  }

  const currentPage = parseInt(params.page || "1", 10);
  const limit = params.limit || "12";

  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.teach) query.set("teach", params.teach);
  if (params.learn) query.set("learn", params.learn);
  if (params.location) query.set("location", params.location);
  query.set("page", String(currentPage));
  query.set("limit", limit);

  const result = await searchPartners(query, token);

  const partners = (result.data || []).map((partner) => ({
    id: partner.id,
    name: partner.full_name,
    username: partner.username,
    avatar: partner.avatar_url || "/profile.jpg",
    match: 100, // TODO: endpoint /api/partner belum kirim skor match, sementara hardcode
    teach: partner.teach?.length ? partner.teach : ["Not specified"],
    learn: partner.learn?.length ? partner.learn : ["Not specified"],
  }));

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams(query);
    p.set("page", String(page));
    return `/dashboard/search?${p.toString()}`;
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 pt-20 pb-10 px-4 sm:px-6">
      <div>
        <h2 className="text-2xl font-bold">Hasil Pencarian</h2>
        {params.search && (
          <p className="text-sm text-muted-foreground">
            Menampilkan hasil untuk &quot;{params.search}&quot;
          </p>
        )}
      </div>

      {partners.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">
          Tidak ada partner yang cocok dengan pencarian ini.
        </div>
      )}

      <div className="flex justify-center gap-3 pt-4">
        {currentPage > 1 && (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Sebelumnya
          </Link>
        )}
        {partners.length === Number(limit) && (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Selanjutnya
          </Link>
        )}
      </div>
    </section>
  );
}
