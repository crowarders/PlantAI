import { readUsers, publicUser } from "../_lib/users.js";
import { verifyPassword, signJWT, sessionCookie } from "../_lib/auth.js";

const SESSION_DAYS = 7;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const { email, password } = req.body || {};
  const emailNorm = String(email || "").trim().toLowerCase();

  const users = await readUsers();
  const record = users[emailNorm];
  // Хэрэглэгч байхгүй ч мөн адил алдаа буцааж, и-мэйл бүртгэлтэй эсэхийг мэдэгдэхгүй
  const ok = record && (await verifyPassword(String(password || ""), record.passwordHash));
  if (!ok) return res.status(401).json({ error: "И-мэйл эсвэл нууц үг буруу" });

  const token = await signJWT({ email: emailNorm }, secret, SESSION_DAYS * 24 * 3600);
  res.setHeader("Set-Cookie", sessionCookie("pa_session", token, SESSION_DAYS * 24 * 3600));
  return res.status(200).json({ user: publicUser(record) });
}
