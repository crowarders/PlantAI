import { getSessionEmail, setCors } from "../_lib/auth.js";
import { bankInfo, PRICING } from "../_lib/pricing.js";

export default async function handler(req, res) {
  setCors(req, res, "GET");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const email = await getSessionEmail(req, secret);
  if (!email) return res.status(401).json({ error: "Эхлээд нэвтэрнэ үү" });

  return res.status(200).json({ bank: bankInfo(), pricing: PRICING });
}
