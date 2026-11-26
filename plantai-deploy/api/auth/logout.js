import { clearCookie, setCors } from "../_lib/auth.js";

export default async function handler(req, res) {
  setCors(req, res, "POST");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Set-Cookie", clearCookie("pa_session"));
  return res.status(200).json({ ok: true });
}
