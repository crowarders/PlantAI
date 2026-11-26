import { readUsers, writeUsers, publicUser } from "../_lib/users.js";
import { hashPassword, signJWT, sessionCookie, setCors, isAppClient } from "../_lib/auth.js";

const SESSION_DAYS = 7;
const APP_SESSION_DAYS = 30; // гар утасны апп — долоо хоног бүр дахин нэвтрүүлэхгүй
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  setCors(req, res, "POST");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const { email, password, name } = req.body || {};
  const emailNorm = String(email || "").trim().toLowerCase();
  if (!emailNorm || !EMAIL_RE.test(emailNorm)) return res.status(400).json({ error: "И-мэйл буруу байна" });
  if (!password || String(password).length < 8) return res.status(400).json({ error: "Нууц үг 8+ тэмдэгт байх ёстой" });
  if (!name || !String(name).trim()) return res.status(400).json({ error: "Нэрээ оруулна уу" });

  const users = await readUsers();
  if (users[emailNorm]) return res.status(409).json({ error: "Энэ и-мэйл бүртгэлтэй байна" });

  const record = {
    email: emailNorm,
    name: String(name).trim().slice(0, 80),
    passwordHash: await hashPassword(String(password)),
    createdAt: new Date().toISOString(),
    vip: { status: "none", plan: null, billing: null, expiresAt: null, requestedAt: null, approvedAt: null, note: null },
  };
  users[emailNorm] = record;
  await writeUsers(users);

  if (isAppClient(req)) {
    // Апп токеныг өөрөө хадгалж Bearer header-ээр илгээнэ (cookie хэрэглэхгүй)
    const appToken = await signJWT({ email: emailNorm }, secret, APP_SESSION_DAYS * 24 * 3600);
    return res.status(201).json({ user: publicUser(record), token: appToken });
  }
  const token = await signJWT({ email: emailNorm }, secret, SESSION_DAYS * 24 * 3600);
  res.setHeader("Set-Cookie", sessionCookie("pa_session", token, SESSION_DAYS * 24 * 3600));
  return res.status(201).json({ user: publicUser(record) });
}
