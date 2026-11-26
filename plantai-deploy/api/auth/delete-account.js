import { readUsers, writeUsers } from "../_lib/users.js";
import { getSessionEmail, verifyPassword, clearCookie, setCors } from "../_lib/auth.js";

/* Бүртгэлээ бүрмөсөн устгах — Google Play бүртгэл үүсгэдэг апп бүрээс
   апп дотор болон вэбээр устгах боломж шаарддаг. Санамсаргүй устгахаас
   сэргийлж нууц үгээр дахин баталгаажуулна. */
export default async function handler(req, res) {
  setCors(req, res, "POST");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const email = await getSessionEmail(req, secret);
  if (!email) return res.status(401).json({ error: "Эхлээд нэвтэрнэ үү" });

  const users = await readUsers();
  const record = users[email];
  if (!record) return res.status(401).json({ error: "Хэрэглэгч олдсонгүй" });

  const { password } = req.body || {};
  const ok = await verifyPassword(String(password || ""), record.passwordHash);
  if (!ok) return res.status(403).json({ error: "Нууц үг буруу" });

  delete users[email];
  await writeUsers(users);

  res.setHeader("Set-Cookie", clearCookie("pa_session"));
  return res.status(200).json({ ok: true });
}
