import { authenticate } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    matchId: string;
  }>;
};

type MessageResponse = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  display_time: string;
};

export const formattedDate = (waktu: string): string => {
  const date = new Date(waktu);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.round(
    (today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  if (diffDays === 1) {
    return "Kemarin";
  }

  if (diffDays >= 2 && diffDays <= 6) {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
    }).format(date);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export async function GET(request: NextRequest, { params }: Props) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  const { matchId } = await params;

  if (!matchId) {
    return NextResponse.json(
      { message: "Match ID is required" },
      { status: 400 },
    );
  }

  // Validasi match
  const { data: match, error: errorMatch } = await supabaseAdmin
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .or(`user_a_id.eq.${user!.userId},user_b_id.eq.${user!.userId}`)
    .eq("status", "accepted")
    .single();

  if (errorMatch || !match) {
    return NextResponse.json(
      { message: "Match tidak ditemukan" },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);

  const before = searchParams.get("before");

  const limit = 20;

  let query = supabaseAdmin
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("match_id", matchId)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  // Ambil pesan yang lebih lama
  if (before) {
    query = query.lt("created_at", before);
  }

  const { data: messages, error: errorMessage } = await query;

  if (errorMessage) {
    return NextResponse.json(
      { message: errorMessage.message },
      { status: 500 },
    );
  }

  // Balik lagi agar frontend menerima urutan lama → baru
  const sortedMessages = (messages ?? []).reverse();

  const response: MessageResponse[] = sortedMessages.map((message) => ({
    id: message.id,
    sender_id: message.sender_id,
    content: message.content,
    created_at: message.created_at,
    display_time: formattedDate(message.created_at),
  }));

  return NextResponse.json(
    {
      message: "Success get messages",
      data: response,

      pagination: {
        hasMore: messages?.length === limit,

        nextCursor: response.length > 0 ? response[0].created_at : null,
      },
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest, { params }: Props) {
  const { user, error } = authenticate(request);

  if (error) {
    return error;
  }

  const { matchId } = await params;
  const { message } = await request.json();

  if (!matchId) {
    return NextResponse.json(
      { message: "Match ID is required" },
      { status: 400 },
    );
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { message: "Message is required" },
      { status: 400 },
    );
  }

  const { data: match, error: errorMatch } = await supabaseAdmin
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .or(`user_a_id.eq.${user!.userId},user_b_id.eq.${user!.userId}`)
    .eq("status", "accepted")
    .single();

  if (errorMatch || !match) {
    return NextResponse.json(
      { message: "Match tidak ditemukan" },
      { status: 404 },
    );
  }

  // Kirim message dari request
  const { data: messageData, error: errorMessage } = await supabaseAdmin
    .from("messages")
    .insert({
      match_id: match.id,
      sender_id: user!.userId,
      content: message.trim(),
    })
    .select("id, content, created_at")
    .single();

  if (errorMessage) {
    return NextResponse.json(
      { message: errorMessage.message },
      { status: 500 },
    );
  }

  const displayTime = formattedDate(messageData.created_at);

  // Broadcast pesan baru ke semua client yang subscribe channel percakapan
  // ini. Dipakai (bukan postgres_changes) karena browser client Supabase
  // tidak terautentikasi lewat Supabase Auth (project ini pakai JWT custom
  // sendiri), sehingga RLS akan selalu memblokir event postgres_changes.
  // Broadcast dikirim dari server (supabaseAdmin) sehingga tidak terikat RLS.
  try {
    await supabaseAdmin.channel(`messages-${match.id}`).send({
      type: "broadcast",
      event: "new_message",
      payload: {
        id: messageData.id,
        match_id: match.id,
        sender_id: user!.userId,
        content: messageData.content,
        created_at: messageData.created_at,
        display_time: displayTime,
      },
    });
  } catch (broadcastError) {
    // Broadcast gagal tidak boleh menggagalkan response utama — pesan
    // sudah tersimpan di database, ini cuma notifikasi realtime tambahan.
    console.error("Gagal broadcast pesan baru:", broadcastError);
  }

  return NextResponse.json(
    {
      message: "Success send message",
      data: {
        id: messageData.id,
        content: messageData.content,
        created_at: messageData.created_at,
        display_time: displayTime,
      },
    },
    { status: 201 },
  );
}
