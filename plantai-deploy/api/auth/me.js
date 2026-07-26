import { readUsers, publicUser } from "../_lib/users.js";
import { getSessionEmail } from "../_lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const email = await getSessionEmail(req, secret);
  if (!email) return res.status(401).json({ error: "Нэвтрээгүй байна" });

  const users = await readUsers();
  const record = users[email];
  if (!record) return res.status(401).json({ error: "Хэрэглэгч олдсонгүй" });

  return res.status(200).json({ user: publicUser(record) });
}
