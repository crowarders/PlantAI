import { readUsers } from "../_lib/users.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Secret");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (ADMIN_SECRET)" });
  if (req.headers["x-admin-secret"] !== adminSecret) return res.status(403).json({ error: "Эрхгүй" });

  const users = await readUsers();
  const list = Object.values(users)
    .map((u) => ({
      email: u.email, name: u.name, createdAt: u.createdAt,
      status: u.vip?.status || "none", plan: u.vip?.plan || null, billing: u.vip?.billing || null,
      requestedAt: u.vip?.requestedAt || null, approvedAt: u.vip?.approvedAt || null,
      expiresAt: u.vip?.expiresAt || null,
    }))
    .sort((a, b) => {
      const rank = { pending: 0, active: 1, none: 2 };
      return (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || (b.requestedAt || "").localeCompare(a.requestedAt || "");
    });

  return res.status(200).json({ users: list });
}
