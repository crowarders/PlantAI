import { readUsers, writeUsers, publicUser } from "../_lib/users.js";
import { computeExpiry } from "../_lib/pricing.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Secret");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (ADMIN_SECRET)" });
  if (req.headers["x-admin-secret"] !== adminSecret) return res.status(403).json({ error: "Эрхгүй" });

  const { email, action, note } = req.body || {};
  const emailNorm = String(email || "").trim().toLowerCase();
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "action буруу байна" });

  const users = await readUsers();
  const record = users[emailNorm];
  if (!record) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });
  if (!record.vip || record.vip.status !== "pending")
    return res.status(409).json({ error: "Энэ хэрэглэгчид хүлээгдэж буй хүсэлт алга" });

  if (action === "approve") {
    record.vip = {
      ...record.vip,
      status: "active",
      expiresAt: computeExpiry(record.vip.billing),
      approvedAt: new Date().toISOString(),
      note: note ? String(note).slice(0, 200) : record.vip.note,
    };
  } else {
    record.vip = { status: "none", plan: null, billing: null, expiresAt: null, requestedAt: null, approvedAt: null, note: note || null };
  }
  users[emailNorm] = record;
  await writeUsers(users);

  return res.status(200).json({ user: publicUser(record) });
}
