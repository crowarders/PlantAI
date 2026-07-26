import { get, put } from "@vercel/blob";

const FILE = "users.json";

/* Хэрэглэгч бүрийн бичлэг:
   { email, name, passwordHash, createdAt,
     vip: { status: 'none'|'pending'|'active', plan: 'premium'|'vip',
            billing: 'month'|'year'|'life', expiresAt: iso|null,
            requestedAt: iso|null, approvedAt: iso|null, note: string|null } }
   Бүх хэрэглэгчийг { [email]: record } хэлбэрээр нэг blob-д хадгална —
   гишүүдийн тоо цөөн тул хангалттай, шинэ DB нэмэлт шаардлагагүй. */

export async function readUsers() {
  try {
    const result = await get(FILE, { access: "private", useCache: false });
    if (!result) return {};
    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);
    return data && typeof data === "object" ? data : {};
  } catch (e) {
    return {};
  }
}

export async function writeUsers(users) {
  await put(FILE, JSON.stringify(users), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export function effectiveTier(user) {
  const v = user?.vip;
  if (!v || v.status !== "active") return "free";
  if (v.expiresAt && new Date(v.expiresAt).getTime() <= Date.now()) return "free";
  return v.plan || "free";
}

export function publicUser(user) {
  return {
    email: user.email,
    name: user.name,
    tier: effectiveTier(user),
    vip: {
      status: user.vip?.status || "none",
      plan: user.vip?.plan || null,
      billing: user.vip?.billing || null,
      expiresAt: user.vip?.expiresAt || null,
    },
  };
}
