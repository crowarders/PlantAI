import { readUsers } from "../_lib/users.js";
import { getSessionEmail, signJWT } from "../_lib/auth.js";
import { effectiveTier } from "../_lib/users.js";

const AGROCONSOLE_URL = "https://agroconsole.vercel.app";
const HANDOFF_TTL_SEC = 10 * 60; // богино хугацаатай — зөвхөн шилжихэд ашиглана

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const email = await getSessionEmail(req, secret);
  if (!email) return res.status(401).json({ error: "Эхлээд нэвтэрнэ үү" });

  const users = await readUsers();
  const record = users[email];
  if (!record || effectiveTier(record) !== "vip")
    return res.status(403).json({ error: "Зөвхөн идэвхтэй VIP гишүүд АгроКонсол ашиглах эрхтэй" });

  const token = await signJWT({ email, vip: true }, secret, HANDOFF_TTL_SEC);
  return res.status(200).json({ url: AGROCONSOLE_URL + "/?t=" + token });
}
